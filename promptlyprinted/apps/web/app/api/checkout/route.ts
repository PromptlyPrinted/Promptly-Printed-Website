import { Prisma, OrderStatus, ShippingMethod } from '@repo/database';
import { prisma } from '@repo/database';
import { auth } from '@clerk/nextjs/server';
import type { User } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { temporaryImageStore } from '@/lib/temp-image-store';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

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
  copies: z
    .coerce.number()
    .int()
    .min(1)         // 1) Apply numeric constraints
    .optional()     // 2) Allow it to be missing
    .default(1),    // 3) Default to 1 if missing
  images: z.array(ImageSchema),

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

const CheckoutRequestSchema = z.array(CheckoutItemSchema);

type ValidatedCheckoutItem = z.infer<typeof CheckoutItemSchema>;
type ValidatedCheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
type ImageSchemaType = z.infer<typeof ImageSchema>;

async function getImageUrl(url: string): Promise<string | null> {
  try {
    if (!url) {
      console.error('Empty image URL provided');
      return null;
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
          where: { id: idParam[1] }
        });
        
        if (savedImage) {
          console.log('Found saved image in database:', { id: idParam[1], url: savedImage.url });
          return savedImage.url;
        }
        
        // Fallback to temporary store
        const tempImage = temporaryImageStore.get(idParam[1]);
        if (!tempImage) {
          console.error('Image not found in database or temporary store:', idParam[1]);
          return null;
        }
        console.log('Resolved save-temp-image URL from temporary store:', { id: idParam[1], url: tempImage.url });
        return tempImage.url;
      }
    }
    
    // If it's a relative URL, make it absolute
    if (url.startsWith('/')) {
      const absoluteUrl = `${process.env.NEXT_PUBLIC_APP_URL}${url}`;
      console.log('Converted relative URL to absolute:', { relative: url, absolute: absoluteUrl });
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
    const authResult = await auth();

    if (!authResult?.userId) {
      console.error('Authentication failed: No userId found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUserId = authResult.userId;
    // Determine base URL for building absolute image URLs
    const urlObj = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? urlObj.origin;
    console.log(`Authenticated Clerk User ID: ${clerkUserId}`);

    // Get success and cancel URLs from query parameters
    const successUrl = urlObj.searchParams.get('successUrl') || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = urlObj.searchParams.get('cancelUrl') || `${origin}/cancel`;

    let orderItems: ValidatedCheckoutRequest;
    try {
      const body = await req.json();
      orderItems = CheckoutRequestSchema.parse(body);
      console.log('Parsed Checkout Items:', JSON.stringify(orderItems, null, 2));
    } catch (error: unknown) {
      console.error('Failed to parse request body:', error);
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid request body format', details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Failed to parse request body' }, { status: 400 });
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Checkout items cannot be empty' }, { status: 400 });
    }

    let dbUser: User | null = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
      });

      if (!dbUser) {
        console.error(`User with clerkId ${clerkUserId} not found in the database.`);
        return NextResponse.json(
          { error: 'User data not found. Please contact support.' },
          { status: 500 }
        );
      }
      console.log(`Found existing user with DB ID: ${dbUser.id}`);

      const total = orderItems.reduce((acc, item) => acc + item.price * item.copies, 0);
      console.log(`Calculated Total Price: ${total}`);

      // Hard-coded shipping details for demonstration
      const recipientName = "Mr Testy McTestface";
      const recipientEmail = "test@example.com";
      const recipientPhone = "1234567890";
      const recipientAddressLine1 = "14 test place";
      const recipientAddressLine2 = "test";
      const recipientPostalOrZipCode = "12345";
      const recipientCountry = "US";
      const recipientTownOrCity = "somewhere";
      const recipientStateOrCounty = null;

      if (
        !recipientName ||
        !recipientAddressLine1 ||
        !recipientPostalOrZipCode ||
        !recipientCountry ||
        !recipientTownOrCity
      ) {
        throw new Error(
          "Missing required shipping details. Please complete the shipping information before proceeding."
        );
      }

      // Build the order creation data
      const orderData = {
        userId: dbUser.id,
        totalPrice: total,
        status: 'PENDING' as OrderStatus,
        merchantReference: "MyMerchantReference1",
        shippingMethod: "STANDARD" as ShippingMethod,
        callbackUrl: "https://promptlyprinted.com/callback",
        idempotencyKey: randomUUID(),
        metadata: {
          mycustomkey: "some-guid",
          someCustomerPreference: {
            preference1: "something",
            preference2: "red"
          },
          sourceId: 12345
        },
        recipient: {
          create: {
            name: recipientName,
            email: recipientEmail,
            phoneNumber: recipientPhone,
            addressLine1: recipientAddressLine1,
            addressLine2: recipientAddressLine2 || "",
            postalCode: recipientPostalOrZipCode,
            countryCode: recipientCountry,
            city: recipientTownOrCity,
            state: recipientStateOrCounty || null,
          }
        },
        orderItems: {
          create: await Promise.all(orderItems.map(async (item) => {
            // Convert each image object into something we can store in `assets` (JSON),
            // since there's no separate `images` relation in OrderItem.
            const resolvedAssets = await Promise.all(item.images.map(async (img) => {
              const actualUrl = await getImageUrl(img.url);
              if (!actualUrl) {
                console.warn(`Could not resolve or invalid image URL: ${img.url} for product ${item.productId}`);
                return null;
              }
              const publicUrl = actualUrl.startsWith('/api/save-temp-image')
                ? actualUrl
                : `/api/save-temp-image?url=${encodeURIComponent(actualUrl)}`;
              return {
                url: publicUrl,
                dpi: img.dpi,
                width: img.width,
                height: img.height,
                isPublic: true,
              };
            })).then(assets => assets.filter(Boolean));

            return {
              productId: item.productId,   
              copies: item.copies,
              price: item.price,
              assets: resolvedAssets, 
              merchantReference: item.merchantReference || `item #${item.productId}`,
              recipientCostAmount: item.recipientCostAmount ?? item.price,
              recipientCostCurrency: item.currency || "USD",
              sizing: item.customization?.sizing,
              attributes: {
                designUrl: item.designUrl,
                printArea: item.customization?.printArea,
                position: item.customization?.position
              },
            };
          })),
        },
      };

      // Create order in database first
      const order = await prisma.order.create({
        data: orderData,
        include: {
          orderItems: true,
        },
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: dbUser.email,
        line_items: orderItems.map(item => {
          const images = item.images.map(img => {
            const resolvedUrl = getImageUrl(img.url);
            if (!resolvedUrl) {
              console.error('Failed to resolve image URL:', img.url);
              return '';
            }
            console.log('Resolved image URL:', { original: img.url, resolved: resolvedUrl });
            return resolvedUrl;
          }).filter(Boolean);

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
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          orderId: order.id.toString()
        },
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ']
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

      if (!session.url) {
        throw new Error('Failed to create Stripe checkout session');
      }

      // Update order with Stripe session ID
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id }
      });

      // Clean up temporary images
      orderItems.forEach((item) => {
        item.images.forEach((img) => {
          if (img.url.startsWith('temp:')) {
            const tempId = img.url.split(':')[1];
            temporaryImageStore.delete(tempId);
          }
        });
      });

      return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
      console.error('Error during checkout process:', error);
      if (error instanceof Error) {
        if ('code' in error && typeof (error as any).code === 'string') {
          console.error(`Prisma Error Code: ${(error as any).code}, Meta: ${JSON.stringify((error as any).meta)}`);
        }
        return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
      } else {
        console.error('Unknown checkout error:', JSON.stringify(error));
        return NextResponse.json({ error: 'Failed to create order', details: 'An unknown error occurred' }, { status: 500 });
      }
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: unknown) {
    console.error('Error during checkout process:', error);
    if (error instanceof Error) {
      if ('code' in error && typeof (error as any).code === 'string') {
        console.error(`Prisma Error Code: ${(error as any).code}, Meta: ${JSON.stringify((error as any).meta)}`);
      }
      return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
    } else {
      console.error('Unknown checkout error:', JSON.stringify(error));
      return NextResponse.json({ error: 'Failed to create order', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}