import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
      
      if (!session.metadata?.orderId) {
        console.error('No orderId found in session metadata');
        return NextResponse.json({ error: 'No orderId found' }, { status: 400 });
      }

      const orderId = parseInt(session.metadata.orderId);
      
      // Log the shipping information for debugging
      console.log('Stripe shipping information:', {
        name: session.customer_details?.name,
        address: session.customer_details?.address,
        phone: session.customer_details?.phone,
        email: session.customer_details?.email
      });

      // Ensure we have the required shipping information
      if (!session.customer_details?.address?.line1 || !session.customer_details?.address?.city || !session.customer_details?.address?.postal_code || !session.customer_details?.address?.country) {
        console.error('Missing required shipping information:', session.customer_details?.address);
        return NextResponse.json({ error: 'Missing required shipping information' }, { status: 400 });
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
            }
          },
          status: OrderStatus.COMPLETED
        },
        include: {
          recipient: true,
          orderItems: true
        }
      });

      console.log('Updated order with shipping information:', {
        orderId: updatedOrder.id,
        recipient: updatedOrder.recipient,
        status: updatedOrder.status
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