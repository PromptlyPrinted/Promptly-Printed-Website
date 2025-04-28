import { Prisma } from '@repo/database';
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

function getImageUrl(url: string): string | null {
  try {
    if (!url) return null;
    
    // Handle temp: prefix
    if (url.startsWith('temp:')) {
      const tempId = url.split(':')[1];
      const tempImage = temporaryImageStore.get(tempId);
      return tempImage?.url || null;
    }
    
    // Handle save-temp-image URLs
    if (url.includes('/api/save-temp-image')) {
      const idParam = url.match(/[?&]id=([^&]+)/);
      if (idParam) {
        const tempImage = temporaryImageStore.get(idParam[1]);
        return tempImage?.url || null;
      }
    }
    
    return url;
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
    console.log(`Authenticated Clerk User ID: ${clerkUserId}`);

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
        status: 'PENDING',
        merchantReference: "MyMerchantReference1",
        shippingMethod: "STANDARD",
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
          create: orderItems.map((item) => {
            // Convert each image object into something we can store in `assets` (JSON),
            // since there's no separate `images` relation in OrderItem.
            const resolvedAssets = item.images.map((img) => {
              const actualUrl = getImageUrl(img.url);
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
            }).filter(Boolean);

            return {
              productId: item.productId,   
              // "copies" instead of "quantity"
              copies: item.copies,
              price: item.price,
              // We'll store these "images" as JSON in the OrderItem's "assets" field
              assets: resolvedAssets, 
              // Additional fields
              merchantReference: item.merchantReference || `item #${item.productId}`,
              recipientCostAmount: item.recipientCostAmount ?? item.price,
              recipientCostCurrency: item.currency || "USD",
              sizing: item.customization?.sizing,
              // If you want to store customization or designUrl in "attributes", do so:
              attributes: {
                designUrl: item.designUrl,
                printArea: item.customization?.printArea,
                position: item.customization?.position
              },
            };
          }),
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
        line_items: orderItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: item.images.map(img => img.url),
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.copies || 1,
        })),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?canceled=true`,
        metadata: {
          orderId: order.id,
          userId: dbUser.id,
        },
      });

      if (!session.url) {
        throw new Error('Failed to create Stripe checkout session');
      }

      // Update order with Stripe session ID
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
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

      return NextResponse.json({ 
        url: session.url,
        orderId: order.id,
        status: order.status
      }, { status: 201 });
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