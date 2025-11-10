import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const isGuestCheckout = session.metadata?.isGuestCheckout === 'true';

      // Handle guest checkout - create user and order
      if (isGuestCheckout) {
        console.log('Processing guest checkout order');

        if (!session.customer_details?.email) {
          console.error('No email found for guest checkout');
          return NextResponse.json(
            { error: 'No email found' },
            { status: 400 }
          );
        }

        // Parse order data from metadata
        const orderData = JSON.parse(session.metadata?.orderData || '{}');
        const customerEmail = session.customer_details?.email;

        // Find or create guest user
        let user = await prisma.user.findUnique({
          where: { email: customerEmail },
        });

        if (!user) {
          // Create new guest user
          user = await prisma.user.create({
            data: {
              email: customerEmail,
              name: session.customer_details.name || 'Guest User',
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
            stripeSessionId: session.id,
            merchantReference: `ORDER-${Date.now()}`,
            shippingMethod: 'STANDARD',
            recipient: {
              create: {
                name: session.customer_details.name || 'Guest',
                email: customerEmail,
                phoneNumber: session.customer_details.phone || null,
                addressLine1: session.customer_details.address?.line1 || 'Pending',
                addressLine2: session.customer_details.address?.line2 || null,
                city: session.customer_details.address?.city || 'Pending',
                state: session.customer_details.address?.state || null,
                postalCode: session.customer_details.address?.postal_code || '00000',
                countryCode: session.customer_details.address?.country || 'US',
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
      if (!session.metadata?.orderId) {
        console.error('No orderId found in session metadata');
        return NextResponse.json(
          { error: 'No orderId found' },
          { status: 400 }
        );
      }

      const orderId = Number.parseInt(session.metadata.orderId);

      // Log the shipping information for debugging
      console.log('Stripe shipping information:', {
        name: session.customer_details?.name,
        address: session.customer_details?.address,
        phone: session.customer_details?.phone,
        email: session.customer_details?.email,
      });

      // Ensure we have the required shipping information
      if (
        !session.customer_details?.address?.line1 ||
        !session.customer_details?.address?.city ||
        !session.customer_details?.address?.postal_code ||
        !session.customer_details?.address?.country
      ) {
        console.error(
          'Missing required shipping information:',
          session.customer_details?.address
        );
        return NextResponse.json(
          { error: 'Missing required shipping information' },
          { status: 400 }
        );
      }

      // Update the recipient information with the shipping details from Stripe
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          recipient: {
            update: {
              name: session.customer_details?.name || 'missing name',
              email: session.customer_details.email || undefined,
              phoneNumber: session.customer_details.phone || undefined,
              addressLine1: session.customer_details.address.line1,
              addressLine2: session.customer_details.address.line2 || undefined,
              city: session.customer_details.address.city,
              state: session.customer_details.address.state || undefined,
              postalCode: session.customer_details.address.postal_code,
              countryCode: session.customer_details.address.country,
            },
          },
          status: OrderStatus.COMPLETED,
        },
        include: {
          recipient: true,
          orderItems: true,
        },
      });

      console.log('Updated order with shipping information:', {
        orderId: updatedOrder.id,
        recipient: updatedOrder.recipient,
        status: updatedOrder.status,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
