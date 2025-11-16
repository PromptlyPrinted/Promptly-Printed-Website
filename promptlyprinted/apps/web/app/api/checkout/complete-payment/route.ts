import { randomUUID } from 'crypto';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment, Currency } from 'square';
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

const CompletePaymentSchema = z.object({
  sourceId: z.string(), // Payment token from Square Web SDK
  items: z.array(CheckoutItemSchema),
  shippingAddress: ShippingAddressSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Complete Payment] Starting...', { hasSourceId: !!body.sourceId });

    // Validate request
    const validation = CompletePaymentSchema.safeParse(body);
    if (!validation.success) {
      console.error('[Complete Payment] Validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sourceId, items, shippingAddress } = validation.data;

    // Get user session if exists
    const session = await getSession(request);
    const dbUser: User | null = session?.user
      ? await prisma.user.findUnique({ where: { id: session.user.id } })
      : null;

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.copies, 0);
    const amountInPence = Math.round(total * 100);

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

    // Create payment with Square
    console.log('[Square Payment] Creating...', { amountInPence });

    const idempotencyKey = randomUUID();

    const paymentResponse = await squareClient.payments.create({
      sourceId: sourceId,
      idempotencyKey: idempotencyKey,
      amountMoney: {
        amount: BigInt(amountInPence),
        currency: Currency.Gbp,
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      referenceId: order.id.toString(),
      note: `Order #${order.id} - ${items.length} item(s)`,
      buyerEmailAddress: shippingAddress.email,
    });

    if (!paymentResponse.payment) {
      throw new Error('Payment response missing payment object');
    }

    console.log('[Square Payment] Created', {
      paymentId: paymentResponse.payment.id,
      status: paymentResponse.payment.status,
      amount: paymentResponse.payment.amountMoney,
    });

    // Update order with payment info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: paymentResponse.payment.status === 'COMPLETED' ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
        metadata: {
          squarePaymentId: paymentResponse.payment.id,
          squarePaymentStatus: paymentResponse.payment.status,
        },
      },
    });

    console.log('[Complete Payment] Success', { orderId: order.id });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: paymentResponse.payment.id,
      status: paymentResponse.payment.status,
    });

  } catch (error: any) {
    console.error('[Complete Payment] Error:', error);

    // Extract Square error details if available
    const errorMessage = error.errors?.[0]?.detail || error.message || 'Payment processing failed';

    return NextResponse.json(
      {
        error: 'Payment processing failed',
        message: errorMessage,
        details: error.errors || [],
      },
      { status: 500 }
    );
  }
}
