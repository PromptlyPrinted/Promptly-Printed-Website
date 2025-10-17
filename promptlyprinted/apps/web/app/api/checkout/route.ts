import { randomUUID } from 'crypto';
import { temporaryImageStore } from '@/lib/temp-image-store';
import { getSession } from '@/lib/session-utils';
import { OrderStatus, ShippingMethod } from '@repo/database';
import { prisma } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ZodError, z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * Save base64 image to file system and return URL
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

  // Return public URL
  return `/uploads/checkout/${fileName}`;
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
      const absoluteUrl = `${process.env.NEXT_PUBLIC_APP_URL}${url}`;
      console.log('Converted relative URL to absolute:', {
        relative: url,
        absolute: absoluteUrl,
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

      // Prepare Stripe session metadata
      const stripeMetadata: Record<string, string> = {
        isGuestCheckout: isGuestCheckout.toString(),
      };

      if (order) {
        stripeMetadata.orderId = order.id.toString();
      } else {
        // For guest checkout, store order data in metadata to create after payment
        stripeMetadata.orderData = JSON.stringify({
          items: orderItems.items,
          totalPrice: total,
        });
      }

      // Create Stripe checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        customer_email: dbUser?.email || undefined, // Allow Stripe to collect email for guests
        line_items: orderItems.items.map((item) => {
          const images = item.images
            .map((img) => {
              const resolvedUrl = getImageUrl(img.url);
              if (!resolvedUrl) {
                console.error('Failed to resolve image URL:', img.url);
                return '';
              }
              console.log('Resolved image URL:', {
                original: img.url,
                resolved: resolvedUrl,
              });
              return resolvedUrl;
            })
            .filter(Boolean);

          if (images.length === 0) {
            console.error('No valid images found for item:', item.productId);
            throw new Error(`No valid images found for item ${item.productId}`);
          }

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                images: images,
              },
              unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.copies,
          };
        }),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/cancel`,
        metadata: stripeMetadata,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ'],
        },
        payment_method_types: ['card', 'link', 'paypal'],
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 0,
                currency: 'usd',
              },
              display_name: 'Free shipping',
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 7,
                },
              },
            },
          },
        ],
      });

      if (!stripeSession.url) {
        throw new Error('Failed to create Stripe checkout session');
      }

      // Update order with Stripe session ID (only for authenticated users)
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { stripeSessionId: stripeSession.id },
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

      console.log('Checkout session created successfully', {
        sessionId: stripeSession.id,
        isGuestCheckout,
        orderId: order?.id || 'N/A (will be created after payment)',
      });

      return NextResponse.json({ url: stripeSession.url });
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
