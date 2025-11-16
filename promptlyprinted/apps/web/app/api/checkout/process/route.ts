import { randomUUID } from 'crypto';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment, Currency, Country } from 'square';
import { z } from 'zod';

// Square client configuration
const squareEnvironment = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: squareEnvironment,
});

const ShippingAddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const CheckoutItemSchema = z.object({
  productId: z.coerce.number().int(),
  name: z.string(),
  price: z.number(),
  copies: z.number().int().min(1),
  images: z.array(z.object({ url: z.string() })),
  color: z.string(),
  size: z.string(),
  designUrl: z.string().optional(),
});

const ProcessCheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema),
  shippingAddress: ShippingAddressSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Checkout Process] Starting...', { itemCount: body.items?.length });

    // Validate request
    const validation = ProcessCheckoutSchema.safeParse(body);
    if (!validation.success) {
      console.error('[Checkout Process] Validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { items, shippingAddress } = validation.data;

    // Get user session if exists
    const session = await getSession(request);
    const dbUser: User | null = session?.user
      ? await prisma.user.findUnique({ where: { id: session.user.id } })
      : null;

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.copies, 0);

    // Create database order first
    console.log('[Database Order] Creating...');
    const order = await prisma.order.create({
      data: {
        userId: dbUser?.id || 'guest',
        totalPrice: total,
        shippingMethod: ShippingMethod.STANDARD,
        status: OrderStatus.PENDING,
        recipient: {
          create: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: shippingAddress.email,
            phoneNumber: shippingAddress.phone,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || null,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            countryCode: shippingAddress.country,
          },
        },
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            copies: item.copies,
            price: item.price,
            attributes: {
              color: item.color,
              size: item.size,
            },
            assets: item.designUrl ? [{ url: item.designUrl }] : undefined,
          })),
        },
      },
      include: {
        recipient: true,
        orderItems: true,
      },
    });

    console.log('[Database Order] Created', { orderId: order.id });

    // Create Square order
    const squareMetadata = {
      orderId: order.id.toString(),
      isGuestCheckout: (!dbUser).toString(),
    };

    const lineItems = items.map((item) => {
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

    console.log('[Square Order] Creating...');
    const squareOrderResponse = await squareClient.orders.create({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: lineItems,
        metadata: squareMetadata,
      },
      idempotencyKey: randomUUID(),
    });

    if (!squareOrderResponse.order) {
      throw new Error('Failed to create Square order');
    }

    const squareOrderId = squareOrderResponse.order.id!;
    console.log('[Square Order] Created', { squareOrderId });

    // Store Square order ID in metadata
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          squareOrderId: squareOrderId,
        },
      },
    });

    // Create payment link (we'll still use this for now, but eventually replace with Web SDK)
    const paymentLinkRequest = {
      idempotencyKey: randomUUID(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        referenceId: squareOrderId,
        lineItems: lineItems,
        metadata: squareMetadata,
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success?orderId=${order.id}`,
        askForShippingAddress: false, // We already collected it
        acceptedPaymentMethods: {
          applePay: true,
          googlePay: true,
        },
      },
      prePopulatedData: {
        buyerEmail: shippingAddress.email,
        // Only include phone if it exists and looks valid
        ...(shippingAddress.phone && shippingAddress.phone.length > 5 ? { buyerPhoneNumber: shippingAddress.phone } : {}),
        buyerAddress: {
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          locality: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country as Country,
        },
      },
    };

    console.log('[Square Payment Link] Creating...');
    const paymentLinkResponse = await squareClient.checkout.paymentLinks.create(paymentLinkRequest);

    if (!paymentLinkResponse.paymentLink?.url) {
      throw new Error('Failed to create payment link');
    }

    console.log('[Square Payment Link] Created', {
      paymentLinkId: paymentLinkResponse.paymentLink.id,
      url: paymentLinkResponse.paymentLink.url,
    });

    // Update order metadata with payment link ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...(order.metadata as object || {}),
          squareOrderId: squareOrderId,
          squarePaymentLinkId: paymentLinkResponse.paymentLink.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      checkoutUrl: paymentLinkResponse.paymentLink.url,
    });

  } catch (error: any) {
    console.error('[Checkout Process] Error:', error);
    return NextResponse.json(
      {
        error: 'Checkout processing failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
