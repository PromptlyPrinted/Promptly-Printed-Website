import { prisma } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { downgradeShipping } from '@/lib/prodigi-actions';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number.parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await req.json();
    const { shippingMethod } = body;

    // Validate shipping method
    const validMethods = ['Budget', 'Standard', 'Express', 'Overnight'];
    if (!shippingMethod || !validMethods.includes(shippingMethod)) {
      return NextResponse.json(
        { error: 'Invalid shipping method' },
        { status: 400 }
      );
    }

    console.log('[Update Shipping] Updating shipping method for order:', {
      orderId,
      newMethod: shippingMethod,
    });

    // Downgrade shipping method
    const result = await downgradeShipping(orderId, shippingMethod);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Update Shipping] Error updating shipping method:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update shipping method',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
