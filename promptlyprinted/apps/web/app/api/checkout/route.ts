import { randomUUID } from 'crypto';
import { temporaryImageStore } from '@/lib/temp-image-store';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { square } from '@repo/payments';
import { Currency } from 'square';
import { ZodError, z } from 'zod';

// Log Square configuration on startup


/**
 * Save base64 image using the storage provider.
 * Uses the three-folder system: /temp for drafts, /saved for user saves, /orders for print files.
 */
async function saveBase64Image(base64Data: string): Promise<string> {
  const { storage } = await import('@/lib/storage');

  // Validate and ensure filename has an extension derived from data URI when present
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  let filename = 'checkout-image';
  if (matches) {
    const [, ext] = matches;
    if (ext) filename = `checkout-image.${ext}`;
  } else if (!base64Data.startsWith('data:image')) {
    throw new Error('Invalid base64 image format');
  }

  // Upload to /temp folder (will be moved to /orders at payment completion)
  const relativeUrl = await storage.uploadFromBase64(base64Data, filename, { folder: 'temp' });
  return relativeUrl;
}

const ImageSchema = z.object({
  url: z.string(),
  dpi: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Use z.coerce.number() to convert string "productId" => number
const CheckoutItemSchema = z.object({
  productId: z.coerce.number().int(),
  name: z.string(),
  price: z.number(),
  // Was `quantity`, but your schema uses `copies`:
  copies: z.coerce
    .number()
    .int()
    .min(1) // 1) Apply numeric constraints
    .optional() // 2) Allow it to be missing
    .default(1), // 3) Default to 1 if missing
  images: z.array(ImageSchema),
  color: z.string(),
  size: z.string(),
  designUrl: z.string().optional(),
  customization: z
    .object({
      printArea: z.string().optional(),
      sizing: z.string().optional(),
      position: z.any().optional(),
    })
    .optional(),
  recipientCostAmount: z.number().optional(),
  currency: z.string().optional(),
  merchantReference: z.string().optional(),
  sku: z.string().optional(),
});

const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutItemSchema),
  referralCode: z.string().optional(),
  designId: z.string().optional(),
});

type ValidatedCheckoutItem = z.infer<typeof CheckoutItemSchema>;
type ValidatedCheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
type ImageSchemaType = z.infer<typeof ImageSchema>;

async function getImageUrl(url: string): Promise<string | null> {
  try {
    if (!url) {
      console.error('Empty image URL provided');
      return null;
    }

    // If it's a base64 image, return it directly
    if (url.startsWith('data:image')) {

      return url;
    }

    // Handle temp: prefix
    if (url.startsWith('temp:')) {
      const tempId = url.split(':')[1];
      const tempImage = temporaryImageStore.get(tempId);
      if (!tempImage) {
        console.error('Temporary image not found:', tempId);
        return null;
      }

      return tempImage.url;
    }

    // Handle save-temp-image URLs
    if (url.includes('/api/save-temp-image')) {
      const idParam = url.match(/[?&]id=([^&]+)/);
      if (idParam) {
        // Try to get the image from the database first
        const savedImage = await prisma.savedImage.findUnique({
          where: { id: idParam[1] },
        });

        if (savedImage) {

          return savedImage.url;
        }

        // Fallback to temporary store
        const tempImage = temporaryImageStore.get(idParam[1]);
        if (!tempImage) {
          console.error(
            'Image not found in database or temporary store:',
            idParam[1]
          );
          return null;
        }

        return tempImage.url;
      }
    }

    // If it's a relative URL, make it absolute
    if (url.startsWith('/')) {
      const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
      const absoluteUrl = `${webUrl}${url}`;

      return absoluteUrl;
    }

    // If it's already an absolute URL, return it
    if (url.startsWith('http')) {

      return url;
    }

    console.error('Invalid image URL format:', url);
    return null;
  } catch (error) {
    console.error('Error resolving image URL:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {


  // Validate required environment variables
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    console.error('[ENV CHECK] Missing SQUARE_ACCESS_TOKEN');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Square access token' },
      { status: 500 }
    );
  }
  if (!process.env.SQUARE_LOCATION_ID) {
    console.error('[ENV CHECK] Missing SQUARE_LOCATION_ID');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Square location ID' },
      { status: 500 }
    );
  }
  if (!process.env.NEXT_PUBLIC_WEB_URL) {
    console.error('[ENV CHECK] Missing NEXT_PUBLIC_WEB_URL');
    return NextResponse.json(
      { error: 'Server configuration error: Missing web URL' },
      { status: 500 }
    );
  }



  try {
    const session = await getSession(req);

    // Allow guest checkout - no auth required
    // We'll use Stripe's guest checkout and create order after payment
    const userId = session?.user?.id || null;
    // Determine base URL for building absolute image URLs
    const urlObj = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_WEB_URL ?? urlObj.origin;


    // Get success and cancel URLs from query parameters
    const successUrl =
      urlObj.searchParams.get('successUrl') ||
      `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      urlObj.searchParams.get('cancelUrl') || `${origin}/checkout/cancel`;

    let orderItems: ValidatedCheckoutRequest;
    try {
      const body = await req.json();
      orderItems = CheckoutRequestSchema.parse(body);

    } catch (error: unknown) {
      console.error('Failed to parse request body:', error);
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid request body format', details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to parse request body' },
        { status: 400 }
      );
    }

    if (!orderItems.items || orderItems.items.length === 0) {
      return NextResponse.json(
        { error: 'Checkout items cannot be empty' },
        { status: 400 }
      );
    }

    let dbUser: User | null = null;
    let isGuestCheckout = false;

    try {
      if (userId) {
        // Authenticated user - fetch from database
        dbUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!dbUser) {
          console.error(
            `User with id ${userId} not found in the database.`
          );
          return NextResponse.json(
            { error: 'User data not found. Please contact support.' },
            { status: 500 }
          );
        }

      } else {
        // Guest checkout - NO order created yet, webhook will handle it
        isGuestCheckout = true;

      }

      const total = orderItems.items.reduce(
        (acc, item) => acc + item.price * item.copies,
        0
      );

      console.log('[Checkout] Processing checkout', {
        isGuest: isGuestCheckout,
        itemCount: orderItems.items.length,
        total,
      });

      // Save images and prepare order data
      const processedItems = await Promise.all(
        orderItems.items.map(async (item) => {
          // Process images
          const resolvedAssets = await Promise.all(
            item.images.map(async (img) => {
              let finalUrl: string;

              // If it's a base64 image, save it as a file first
              if (img.url.startsWith('data:image')) {
                finalUrl = await saveBase64Image(img.url);
              } else {
                // For non-base64 images, resolve the URL
                const actualUrl = await getImageUrl(img.url);
                if (!actualUrl) {
                  console.warn(
                    `Could not resolve or invalid image URL: ${img.url} for product ${item.productId}`
                  );
                  return null;
                }
                finalUrl = actualUrl.startsWith('/api/save-temp-image')
                  ? actualUrl
                  : `/api/save-temp-image?url=${encodeURIComponent(actualUrl)}`;
              }

              return {
                url: finalUrl,
                printArea: item.customization?.printArea || 'front',
              };
            })
          ).then((assets) => assets.filter(Boolean));

          return {
            productId: item.productId,
            sku: item.sku,
            copies: item.copies,
            price: item.price,
            size: item.size,
            color: item.color,
            designUrl: item.designUrl,
            printArea: item.customization?.printArea,
            assets: resolvedAssets,
            merchantReference: item.merchantReference || `item #${item.productId}`,
          };
        })
      );

      // Prepare Square order metadata
      // Store order data in metadata (webhook will create DB order after payment)
      const squareMetadata: Record<string, string> = {
        isGuestCheckout: isGuestCheckout.toString(),
        email: dbUser?.email || '',
        // Store order data for webhook - NOTE: Square has 500 char limit per field
        // So we need to be mindful of metadata size
        orderData: JSON.stringify({
          itemCount: orderItems.items.length,
          totalPrice: total,
          items: processedItems,
        }),
      };

      // Add competition-related metadata for tracking
      if (orderItems.referralCode) {
        squareMetadata.referralCode = orderItems.referralCode;
      }
      if (orderItems.designId) {
        squareMetadata.designId = orderItems.designId;
      }
      if (userId) {
        squareMetadata.userId = userId;
      }

      // Prepare line items for Square
      // Note: Catalog items with images are disabled because Square's Catalog API
      // requires direct file upload, not URL references. This will be implemented later.

      const lineItems = orderItems.items.map((item) => {
        return {
          name: item.name,
          quantity: item.copies.toString(),
          basePriceMoney: {
            amount: BigInt(Math.round(item.price * 100)),
            currency: Currency.Gbp,
          },
          note: `${item.color} - ${item.size}${item.designUrl ? ' - Custom Design' : ''}`,
        };
      });

      // Create Square order first
      const totalAmountCents = Math.round(total * 100);


      let squareOrderResponse;
      try {
        squareOrderResponse = await square.orders.create({
          order: {
            locationId: process.env.SQUARE_LOCATION_ID!,
            lineItems: lineItems,
            metadata: squareMetadata,
          },
          idempotencyKey: randomUUID(),
        });

      } catch (squareError: any) {
        console.error('[Square Order Creation] Failed', {
          error: squareError.message,
          statusCode: squareError.statusCode,
          errors: squareError.errors,
          body: squareError.body,
        });
        throw new Error(`Square order creation failed: ${squareError.message}`);
      }

      if (!squareOrderResponse.order) {
        throw new Error('Failed to create Square order - no order in response');
      }

      const squareOrderId = squareOrderResponse.order.id!;

      // Create payment link for the order


      let paymentLinkResponse;
      try {
        // Create payment link with only the order reference (id and version)
        // We cannot pass the full order object as it contains read-only fields
        const paymentLinkRequest = {
          idempotencyKey: randomUUID(),
          order: {
            locationId: process.env.SQUARE_LOCATION_ID!,
            referenceId: squareOrderId,
            lineItems: lineItems,
            metadata: squareMetadata,
          },
          checkoutOptions: {
            // Redirect to success page - webhook will create the order
            redirectUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success`,
            askForShippingAddress: true,
            enableCoupon: false, // Disable Square's coupon field - we handle discounts on our checkout page
            acceptedPaymentMethods: {
              applePay: true,
              googlePay: true,
            },
          },
          prePopulatedData: {
            buyerEmail: dbUser?.email || undefined,
          },
        };



        paymentLinkResponse = await square.checkout.paymentLinks.create(paymentLinkRequest);

      } catch (squareError: any) {
        console.error('[Square Payment Link] Failed', {
          error: squareError.message,
          statusCode: squareError.statusCode,
          errors: squareError.errors,
          body: squareError.body,
        });
        throw new Error(`Square payment link creation failed: ${squareError.message}`);
      }

      if (!paymentLinkResponse.paymentLink?.url) {
        throw new Error('Failed to create Square payment link - no URL in response');
      }

      const paymentLinkUrl = paymentLinkResponse.paymentLink.url;
      const paymentLinkId = paymentLinkResponse.paymentLink.id!;

      console.log('[Checkout] Payment link created', {
        paymentLinkId,
        squareOrderId,
        isGuest: isGuestCheckout,
      });

      // Clean up temporary images
      orderItems.items.forEach((item) => {
        item.images.forEach((img) => {
          if (img.url.startsWith('temp:')) {
            const tempId = img.url.split(':')[1];
            temporaryImageStore.delete(tempId);
          }
        });
      });



      return NextResponse.json({ url: paymentLinkUrl });
    } catch (error: unknown) {
      console.error('Error during checkout process:', error);
      if (error instanceof Error) {
        if ('code' in error && typeof (error as any).code === 'string') {
          console.error(
            `Prisma Error Code: ${(error as any).code}, Meta: ${JSON.stringify((error as any).meta)}`
          );
        }
        return NextResponse.json(
          { error: 'Failed to create order', details: error.message },
          { status: 500 }
        );
      } else {
        console.error('Unknown checkout error:', JSON.stringify(error));
        return NextResponse.json(
          {
            error: 'Failed to create order',
            details: 'An unknown error occurred',
          },
          { status: 500 }
        );
      }
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: unknown) {
    console.error('Error during checkout process:', error);
    if (error instanceof Error) {
      if ('code' in error && typeof (error as any).code === 'string') {
        console.error(
          `Prisma Error Code: ${(error as any).code}, Meta: ${JSON.stringify((error as any).meta)}`
        );
      }
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      );
    } else {
      console.error('Unknown checkout error:', JSON.stringify(error));
      return NextResponse.json(
        {
          error: 'Failed to create order',
          details: 'An unknown error occurred',
        },
        { status: 500 }
      );
    }
  }
}
