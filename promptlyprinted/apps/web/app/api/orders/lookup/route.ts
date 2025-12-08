import { prisma } from '@repo/database';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Guest Order Lookup API
 *
 * Allows guests to look up their orders using:
 * 1. Order token (sent in confirmation email)
 * 2. Email + Order ID combination
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    // Method 1: Lookup by token
    if (token) {
      const order = await prisma.order.findFirst({
        where: {
          metadata: {
            path: ['orderToken'],
            equals: token,
          },
        },
        select: {
          id: true,
          createdAt: true,
          totalPrice: true,
          status: true,
          prodigiOrderId: true,
          prodigiStage: true,
          shippingMethod: true,
          recipient: {
            select: {
              name: true,
              email: true,
              city: true,
              state: true,
              postalCode: true,
              countryCode: true,
            },
          },
          shipments: {
            select: {
              id: true,
              carrier: true,
              service: true,
              trackingNumber: true,
              trackingUrl: true,
              shippedAt: true,
            },
          },
          orderItems: {
            select: {
              id: true,
              copies: true,
              price: true,
              attributes: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found. Please check your order token.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ order, accessMethod: 'token' });
    }

    // Method 2: Lookup by email + order ID
    if (email && orderId) {
      const orderIdNum = parseInt(orderId, 10);
      if (isNaN(orderIdNum)) {
        return NextResponse.json(
          { error: 'Invalid order ID format' },
          { status: 400 }
        );
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderIdNum,
          recipient: {
            email: email.toLowerCase().trim(),
          },
        },
        select: {
          id: true,
          createdAt: true,
          totalPrice: true,
          status: true,
          prodigiOrderId: true,
          prodigiStage: true,
          shippingMethod: true,
          recipient: {
            select: {
              name: true,
              email: true,
              city: true,
              state: true,
              postalCode: true,
              countryCode: true,
            },
          },
          shipments: {
            select: {
              id: true,
              carrier: true,
              service: true,
              trackingNumber: true,
              trackingUrl: true,
              shippedAt: true,
            },
          },
          orderItems: {
            select: {
              id: true,
              copies: true,
              price: true,
              attributes: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found. Please check your email and order number.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ order, accessMethod: 'email' });
    }

    return NextResponse.json(
      {
        error: 'Please provide either an order token, or both email and order ID',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Order Lookup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to look up order' },
      { status: 500 }
    );
  }
}
