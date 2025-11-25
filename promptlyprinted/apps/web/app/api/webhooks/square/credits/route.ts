import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@repo/database';
import { addCredits } from '@/lib/credits';

/**
 * Verify Square webhook signature
 */
function verifySquareSignature(
  body: string,
  signature: string,
  webhookSignatureKey: string
): boolean {
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  hmac.update(body);
  const hash = hmac.digest('base64');
  return hash === signature;
}

/**
 * POST /api/webhooks/square/credits
 * Handle Square webhook events for credit purchases
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const signature = headersList.get('x-square-hmacsha256-signature');
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

    if (!webhookSignatureKey) {
      console.error('SQUARE_WEBHOOK_SIGNATURE_KEY not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Read raw body for signature verification
    const body = await request.text();

    // Verify signature
    if (signature && !verifySquareSignature(body, signature, webhookSignatureKey)) {
      console.error('Invalid Square webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    console.log('Square webhook received:', {
      type: event.type,
      eventId: event.event_id,
    });

    // Handle different event types
    switch (event.type) {
      case 'payment.updated':
        await handlePaymentUpdated(event);
        break;

      case 'order.updated':
        await handleOrderUpdated(event);
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Square webhook:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle payment.updated event
 */
async function handlePaymentUpdated(event: any) {
  const payment = event.data?.object?.payment;

  if (!payment) {
    console.error('No payment data in event');
    return;
  }

  console.log('Processing payment.updated:', {
    paymentId: payment.id,
    status: payment.status,
    orderId: payment.order_id,
  });

  // Only process completed payments
  if (payment.status !== 'COMPLETED') {
    console.log('Payment not completed, skipping');
    return;
  }

  // Find the order in our database
  const order = await prisma.order.findFirst({
    where: {
      metadata: {
        path: ['squareOrderId'],
        equals: payment.order_id,
      },
    },
  });

  if (!order) {
    console.error('Order not found for payment:', payment.order_id);
    return;
  }

  // Check if already processed
  if (order.status === 'COMPLETED') {
    console.log('Order already completed, skipping');
    return;
  }

  const metadata = order.metadata as any;
  const packId = metadata.packId;
  const credits = metadata.credits;
  const packName = metadata.packName;

  if (!credits || !packId) {
    console.error('Invalid order metadata:', metadata);
    return;
  }

  try {
    // Add credits to user account
    const result = await addCredits(
      order.userId,
      parseFloat(credits),
      'PURCHASE',
      `Purchased ${packName} (${credits} credits)`,
      {
        packId,
        packName,
        squarePaymentId: payment.id,
        squareOrderId: payment.order_id,
        amountPaid: payment.amount_money?.amount,
        currency: payment.amount_money?.currency,
      }
    );

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        paymentId: payment.id as any, // Store as string in metadata
        metadata: {
          ...(metadata || {}),
          squarePaymentId: payment.id,
          completedAt: new Date().toISOString(),
          creditsAdded: credits,
          newBalance: result.newBalance,
        },
      },
    });

    console.log('✅ Credits added successfully:', {
      userId: order.userId,
      credits,
      newBalance: result.newBalance,
    });

    // TODO: Send email receipt
    // await sendCreditPurchaseReceipt(order.userId, packName, credits, result.newBalance);

  } catch (error) {
    console.error('Error adding credits:', error);

    // Update order with error
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PENDING',
        metadata: {
          ...(metadata || {}),
          error: error instanceof Error ? error.message : 'Unknown error',
          lastErrorAt: new Date().toISOString(),
        },
      },
    });

    throw error;
  }
}

/**
 * Handle order.updated event
 */
async function handleOrderUpdated(event: any) {
  const orderData = event.data?.object?.order;

  if (!orderData) {
    console.error('No order data in event');
    return;
  }

  console.log('Processing order.updated:', {
    orderId: orderData.id,
    state: orderData.state,
  });

  // You can add additional order state handling here if needed
  // For now, payment.updated is the primary trigger
}

/**
 * Allow Square to verify webhook endpoint with GET request
 */
export async function GET() {
  return NextResponse.json({
    message: 'Square webhook endpoint for credit purchases',
    status: 'active',
  });
}
