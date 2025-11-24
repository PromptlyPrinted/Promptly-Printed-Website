import { prisma } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkOrderActions } from '@/lib/prodigi-actions';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number.parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.prodigiOrderId) {
      return NextResponse.json(
        {
          error: 'Order does not have a Prodigi order ID',
          actions: {
            cancel: { isAvailable: 'No', reason: 'No Prodigi order found' },
            changeRecipientDetails: { isAvailable: 'No', reason: 'No Prodigi order found' },
            changeShippingMethod: { isAvailable: 'No', reason: 'No Prodigi order found' },
          },
        },
        { status: 400 }
      );
    }

    // Check available actions from Prodigi
    const actions = await checkOrderActions(order.prodigiOrderId);

    // Update cache in database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        lastActionCheck: new Date(),
        availableActions: actions as any,
      },
    });

    return NextResponse.json({ actions });
  } catch (error) {
    console.error('[Order Actions] Error checking actions:', error);
    return NextResponse.json(
      {
        error: 'Failed to check order actions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
