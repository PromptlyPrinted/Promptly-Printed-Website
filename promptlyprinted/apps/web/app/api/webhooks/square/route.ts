import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;

// Verify Square webhook signature
function verifySquareWebhook(body: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  const hash = hmac.update(body).digest('base64');
  return hash === signature;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('x-square-hmacsha256-signature');

    if (!signature) {
      console.error('No signature provided in webhook');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifySquareWebhook(body, signature)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle refund events
    if (event.type === 'refund.created' || event.type === 'refund.updated') {
      const refund = event.data.object.refund;

      // Only process completed refunds
      if (refund.status !== 'COMPLETED' && refund.status !== 'PENDING') {
        console.log('Refund not in processable state:', refund.status);
        return NextResponse.json({ received: true });
      }

      const paymentId = refund.payment_id;

      if (!paymentId) {
        console.error('No payment ID found in refund');
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Find the order by Square payment/order ID
      const order = await prisma.order.findFirst({
        where: {
          stripeSessionId: paymentId, // Using same field for Square order ID
        },
      });

      if (!order) {
        console.error('No order found for payment ID:', paymentId);
        return NextResponse.json({ error: 'Order not found' }, { status: 400 });
      }

      // Update order status to CANCELED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELED,
        },
      });

      console.log('Order refunded:', {
        orderId: order.id,
        refundId: refund.id,
        amount: refund.amount_money,
      });

      return NextResponse.json({ received: true });
    }

    // Handle payment.updated event (when payment is completed)
    if (event.type === 'payment.updated' || event.type === 'payment.created') {
      const payment = event.data.object.payment;

      // Check if payment is completed
      if (payment.status !== 'COMPLETED') {
        console.log('Payment not completed yet:', payment.status);
        return NextResponse.json({ received: true });
      }

      // Get order ID from payment metadata or order ID
      const orderId = payment.order_id;

      if (!orderId) {
        console.error('No order ID found in payment');
        return NextResponse.json({ error: 'No order ID' }, { status: 400 });
      }

      // Retrieve the Square order to get metadata
      const squareOrderResponse = await squareClient.orders.get({ orderId });
      const squareOrder = squareOrderResponse.order;

      if (!squareOrder || !squareOrder.metadata) {
        console.error('No metadata found in Square order');
        return NextResponse.json({ error: 'No metadata' }, { status: 400 });
      }

      const isGuestCheckout = squareOrder.metadata.isGuestCheckout === 'true';

      // Handle guest checkout - create user and order
      if (isGuestCheckout) {
        console.log('Processing guest checkout order');

        // Parse order data from metadata
        const orderData = JSON.parse(squareOrder.metadata.orderData || '{}');

        // Get customer email from payment (Square doesn't always include customer info in webhook)
        // You may need to retrieve this from the payment customer_id
        let customerEmail = payment.buyer_email_address;

        if (!customerEmail) {
          console.error('No email found for guest checkout');
          return NextResponse.json(
            { error: 'No email found' },
            { status: 400 }
          );
        }

        // Find or create guest user
        let user = await prisma.user.findUnique({
          where: { email: customerEmail },
        });

        if (!user) {
          // Create new guest user
          user = await prisma.user.create({
            data: {
              email: customerEmail,
              name: 'Guest User',
              emailVerified: false,
              role: 'CUSTOMER',
            },
          });
          console.log('Created new guest user:', user.id);
        } else {
          console.log('Found existing user:', user.id);
        }

        // Create order for guest user
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            totalPrice: orderData.totalPrice,
            status: OrderStatus.COMPLETED,
            stripeSessionId: orderId, // Using same field for now
            merchantReference: `ORDER-${Date.now()}`,
            shippingMethod: 'STANDARD',
            recipient: {
              create: {
                name: 'Pending', // Will be updated when shipping address is available
                email: customerEmail,
                phoneNumber: null,
                addressLine1: 'Pending',
                addressLine2: null,
                city: 'Pending',
                state: null,
                postalCode: '00000',
                countryCode: 'US',
              },
            },
            orderItems: {
              create: orderData.items.map((item: any) => ({
                productId: item.productId,
                copies: item.copies || 1,
                price: item.price,
                merchantReference: item.merchantReference || `item #${item.productId}`,
                recipientCostAmount: item.recipientCostAmount || item.price,
                recipientCostCurrency: item.currency || 'USD',
                attributes: {
                  sku: item.sku,
                  color: item.color,
                  size: item.size,
                  designUrl: item.designUrl,
                },
                assets: item.images || [],
              })),
            },
          },
        });

        console.log('Created guest order:', order.id);
        return NextResponse.json({ received: true, orderId: order.id });
      }

      // Handle authenticated user checkout
      if (!squareOrder.metadata.orderId) {
        console.error('No orderId found in order metadata');
        return NextResponse.json(
          { error: 'No orderId found' },
          { status: 400 }
        );
      }

      const dbOrderId = Number.parseInt(squareOrder.metadata.orderId);

      // Update the order status
      const updatedOrder = await prisma.order.update({
        where: { id: dbOrderId },
        data: {
          status: OrderStatus.COMPLETED,
          // Note: Square doesn't provide shipping address in webhook
          // You may need to fetch it separately or update it in the success page
        },
        include: {
          recipient: true,
          orderItems: true,
        },
      });

      console.log('Updated order:', {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Square webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
