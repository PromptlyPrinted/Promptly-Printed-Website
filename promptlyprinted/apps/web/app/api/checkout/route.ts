import { randomUUID } from 'crypto';
import { temporaryImageStore } from '@/lib/temp-image-store';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment, Currency } from 'square';
import { ZodError, z } from 'zod';

// Log Square configuration on startup
const squareEnvironment = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;

console.log('[Square Config]', {
  hasToken: !!process.env.SQUARE_ACCESS_TOKEN,
  tokenLength: process.env.SQUARE_ACCESS_TOKEN?.length || 0,
  environment: process.env.SQUARE_ENVIRONMENT || 'not set',
  resolvedEnvironment: squareEnvironment,
  hasLocationId: !!process.env.SQUARE_LOCATION_ID,
  locationId: process.env.SQUARE_LOCATION_ID ? `${process.env.SQUARE_LOCATION_ID.substring(0, 8)}...` : 'not set',
});

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: squareEnvironment,
});

/**
 * Create a Square catalog item with image for better checkout UX
 * This allows Square to display product images in the checkout page
 */
async function createSquareCatalogItemWithImage(
  item: ValidatedCheckoutItem,
  imageUrl: string
): Promise<string | null> {
  try {
    // Create catalog image first
    const imageResponse = await squareClient.catalog.createCatalogImage({
      idempotencyKey: randomUUID(),
      image: {
        type: 'IMAGE',
        id: `#${randomUUID()}`,
        imageData: {
          name: `${item.name} - ${item.color} - ${item.size}`,
          url: imageUrl, // Use the absolute URL we generated
        },
      },
    });

    if (!imageResponse.image?.id) {
      console.error('[Square Catalog] Failed to create image');
      return null;
    }

    const catalogImageId = imageResponse.image.id;
    console.log('[Square Catalog] Image created:', catalogImageId);

    // Create catalog item with the image
    const itemResponse = await squareClient.catalog.upsertCatalogObject({
      idempotencyKey: randomUUID(),
      object: {
        type: 'ITEM',
        id: `#${randomUUID()}`,
        itemData: {
          name: item.name,
          description: `${item.color} - ${item.size}${item.designUrl ? ' - Custom Design' : ''}`,
          imageIds: [catalogImageId],
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: `#${randomUUID()}`,
              itemVariationData: {
                itemId: `#${randomUUID()}`,
                name: 'Standard',
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: BigInt(Math.round(item.price * 100)),
                  currency: Currency.Usd,
                },
              },
            },
          ],
        },
      },
    });

    const catalogItemId = itemResponse.catalogObject?.itemData?.variations?.[0]?.id;
    if (catalogItemId) {
      console.log('[Square Catalog] Item created:', catalogItemId);
      return catalogItemId;
    }

    return null;
  } catch (error: any) {
    console.error('[Square Catalog] Failed to create item:', {
      error: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
    });
    return null;
  }
}

/**
 * Save base64 image to file system and return absolute URL
 */
async function saveBase64Image(base64Data: string): Promise<string> {
  const { writeFile, mkdir } = await import('fs/promises');
  const { join } = await import('path');
  const { v4: uuidv4 } = await import('uuid');

  // Extract mime type and base64 data
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const [, extension, data] = matches;
  const fileName = `${uuidv4()}.${extension}`;

  // Create uploads directory if it doesn't exist
  // Use absolute path to public directory in the web app
  const uploadsDir = join(process.cwd(), 'apps', 'web', 'public', 'uploads', 'checkout');
  await mkdir(uploadsDir, { recursive: true });

  // Write file
  const filePath = join(uploadsDir, fileName);
  const buffer = Buffer.from(data, 'base64');
  await writeFile(filePath, buffer);

  // Return absolute public URL for external services (like Prodigi)
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
  const absoluteUrl = `${webUrl}/uploads/checkout/${fileName}`;

  console.log('[Image Save]', {
    fileName,
    relativePath: `/uploads/checkout/${fileName}`,
    absoluteUrl,
  });

  return absoluteUrl;
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
      console.log('Using base64 image directly');
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
      console.log('Resolved temp: image URL:', { tempId, url: tempImage.url });
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
          console.log('Found saved image in database:', {
            id: idParam[1],
            url: savedImage.url,
          });
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
        console.log('Resolved save-temp-image URL from temporary store:', {
          id: idParam[1],
          url: tempImage.url,
        });
        return tempImage.url;
      }
    }

    // If it's a relative URL, make it absolute
    if (url.startsWith('/')) {
      const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
      const absoluteUrl = `${webUrl}${url}`;
      console.log('Converted relative URL to absolute:', {
        relative: url,
        absolute: absoluteUrl,
        baseUrl: webUrl,
      });
      return absoluteUrl;
    }

    // If it's already an absolute URL, return it
    if (url.startsWith('http')) {
      console.log('Using absolute URL:', url);
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
  console.log('=== CHECKOUT API REQUEST START ===');

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

  console.log('[ENV CHECK] All required environment variables present');

  try {
    const session = await getSession(req);

    // Allow guest checkout - no auth required
    // We'll use Stripe's guest checkout and create order after payment
    const userId = session?.user?.id || null;
    // Determine base URL for building absolute image URLs
    const urlObj = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_WEB_URL ?? urlObj.origin;
    console.log(`Authenticated User ID: ${userId}`);

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
      console.log(
        'Parsed Checkout Items:',
        `${orderItems.items.length} items`
      );
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
        console.log(`Found existing user with DB ID: ${dbUser.id}`);
      } else {
        // Guest checkout - we'll create user after payment with Stripe customer email
        isGuestCheckout = true;
        console.log('Guest checkout - will create user after payment');
      }

      const total = orderItems.items.reduce(
        (acc, item) => acc + item.price * item.copies,
        0
      );
      console.log(`Calculated Total Price: ${total}`);

      let order = null;

      // For authenticated users, create order first
      if (dbUser) {
        // Build the order creation data
        const orderData = {
          userId: dbUser.id,
          totalPrice: total,
          status: OrderStatus.PENDING,
          merchantReference: `ORDER-${Date.now()}`,
          shippingMethod: ShippingMethod.STANDARD,
          callbackUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/prodigi`,
          idempotencyKey: randomUUID(),
          metadata: {
            sourceId: Date.now(),
          },
          recipient: {
            create: {
              name: 'Pending',
              email: dbUser.email,
              phoneNumber: null,
              addressLine1: 'Pending',
              addressLine2: '',
              postalCode: '00000',
              countryCode: 'US',
              city: 'Pending',
              state: null,
            },
          },
          orderItems: {
            create: await Promise.all(
              orderItems.items.map(async (item) => {
                // Convert each image object into something we can store in `assets` (JSON),
                // since there's no separate `images` relation in OrderItem.
                const resolvedAssets = await Promise.all(
                  item.images.map(async (img) => {
                    let finalUrl: string;

                    // If it's a base64 image, save it as a file first
                    if (img.url.startsWith('data:image')) {
                      console.log('Converting base64 image to file for item:', item.productId);
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

                    // Only store URL - don't store dpi, width, height to keep database size small
                    return {
                      url: finalUrl,
                      printArea: item.customization?.printArea || 'front',
                    };
                  })
                ).then((assets) => assets.filter(Boolean));

                return {
                  productId: item.productId,
                  copies: item.copies,
                  price: item.price,
                  assets: resolvedAssets,
                  merchantReference:
                    item.merchantReference || `item #${item.productId}`,
                  recipientCostAmount: item.recipientCostAmount ?? item.price,
                  recipientCostCurrency: item.currency || 'USD',
                  sizing: item.customization?.sizing,
                  attributes: {
                    sku: item.sku,
                    designUrl: item.designUrl,
                    printArea: item.customization?.printArea,
                    position: item.customization?.position,
                    color: item.color,
                    size: item.size,
                  },
                };
              })
            ),
          },
        };

        // Create order in database first (without include to avoid 5MB response limit)
        order = await prisma.order.create({
          data: orderData,
        });
      }

      // Prepare Square order metadata
      const squareMetadata: Record<string, string> = {
        isGuestCheckout: isGuestCheckout.toString(),
      };

      if (order) {
        squareMetadata.orderId = order.id.toString();
      } else {
        // For guest checkout, store minimal order data in metadata
        // Square has a 500-character limit per metadata value
        squareMetadata.orderData = JSON.stringify({
          itemCount: orderItems.items.length,
          totalPrice: total,
        });
      }

      // Prepare line items for Square with catalog items (for images)
      console.log('[Square Line Items] Creating catalog items with images...');
      const lineItems = await Promise.all(
        orderItems.items.map(async (item) => {
          // Get the first image URL for this item (the custom design)
          const imageUrl = item.images && item.images.length > 0
            ? await getImageUrl(item.images[0].url)
            : null;

          let catalogObjectId: string | null = null;

          // Try to create catalog item with image if we have one
          if (imageUrl) {
            catalogObjectId = await createSquareCatalogItemWithImage(item, imageUrl);
          }

          // If catalog creation succeeded, use it; otherwise fallback to basic line item
          if (catalogObjectId) {
            console.log(`[Square Line Items] Using catalog item for ${item.name}`);
            return {
              catalogObjectId,
              quantity: item.copies.toString(),
              note: `${item.color} - ${item.size}${item.designUrl ? ' - Custom Design' : ''}`,
            };
          } else {
            console.log(`[Square Line Items] Using basic line item for ${item.name}`);
            return {
              name: item.name,
              quantity: item.copies.toString(),
              basePriceMoney: {
                amount: BigInt(Math.round(item.price * 100)),
                currency: Currency.Usd,
              },
              note: `${item.color} - ${item.size}${item.designUrl ? ' - Custom Design' : ''}`,
            };
          }
        })
      );

      // Create Square order first
      const totalAmountCents = Math.round(total * 100);
      console.log('[Square Order Creation] Starting...', {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItemCount: lineItems.length,
        totalAmount: totalAmountCents,
      });

      let squareOrderResponse;
      try {
        squareOrderResponse = await squareClient.orders.create({
          order: {
            locationId: process.env.SQUARE_LOCATION_ID!,
            lineItems: lineItems,
            metadata: squareMetadata,
          },
          idempotencyKey: randomUUID(),
        });
        console.log('[Square Order Creation] Success', {
          orderId: squareOrderResponse.order?.id,
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
      console.log('[Square Payment Link] Creating...', {
        orderId: squareOrderId,
        redirectUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success`,
      });

      let paymentLinkResponse;
      try {
        paymentLinkResponse = await squareClient.checkout.paymentLinks.create({
        idempotencyKey: randomUUID(),
        orderId: squareOrderId, // Use the existing order ID instead of creating a new order
        checkoutOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success`,
          askForShippingAddress: true,
          acceptedPaymentMethods: {
            applePay: true,
            googlePay: true,
          },
        },
        prePopulatedData: {
          buyerEmail: dbUser?.email || undefined,
        },
      });
        console.log('[Square Payment Link] Success', {
          paymentLinkId: paymentLinkResponse.paymentLink?.id,
          hasUrl: !!paymentLinkResponse.paymentLink?.url,
        });
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

      // Update order with Square order ID (only for authenticated users)
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            stripeSessionId: paymentLinkId, // Using same field for now, will rename in schema update
          },
        });
      }

      // Clean up temporary images
      orderItems.items.forEach((item) => {
        item.images.forEach((img) => {
          if (img.url.startsWith('temp:')) {
            const tempId = img.url.split(':')[1];
            temporaryImageStore.delete(tempId);
          }
        });
      });

      console.log('Square checkout created successfully', {
        paymentLinkId,
        squareOrderId,
        isGuestCheckout,
        orderId: order?.id || 'N/A (will be created after payment)',
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
