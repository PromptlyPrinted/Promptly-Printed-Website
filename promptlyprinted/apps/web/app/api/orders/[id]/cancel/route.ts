import { prisma } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { cancelOrderWithRefund } from '@/lib/prodigi-actions';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number.parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Get order to verify ownership (for customer-facing endpoint)
    // For now, we'll skip auth check since this is called from admin panel
    // TODO: Add proper authentication and authorization

    console.log('[Cancel Order] Cancelling order:', orderId);

    // Cancel order with refund
    const result = await cancelOrderWithRefund(orderId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Cancel Order] Error cancelling order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
