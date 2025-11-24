import { prisma } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { updateShippingAddress } from '@/lib/prodigi-actions';

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
    const {
      name,
      email,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      countryCode,
    } = body;

    // Validate required fields
    if (!name || !addressLine1 || !city || !postalCode || !countryCode) {
      return NextResponse.json(
        { error: 'Missing required address fields' },
        { status: 400 }
      );
    }

    console.log('[Update Address] Updating address for order:', orderId);

    // Update shipping address
    const result = await updateShippingAddress(orderId, {
      name,
      email,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      countryCode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Update Address] Error updating address:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update address',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
