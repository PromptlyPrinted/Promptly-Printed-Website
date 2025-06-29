import { getProdigiProduct } from '@/lib/prodigi';
import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify admin status
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['PENDING', 'COMPLETED', 'CANCELED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    const orderId = Number.parseInt(params.id);
    if (isNaN(orderId)) {
      return new NextResponse('Invalid order ID', { status: 400 });
    }

    const order = await database.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Validate SKU with Prodigi
    const prodigiProduct = await getProdigiProduct(order.prodigiSku);
    if (!prodigiProduct) {
      return new NextResponse('Invalid Prodigi SKU', { status: 400 });
    }

    // If Prodigi API key is set and order has a Prodigi order ID, update status in Prodigi
    if (order.prodigiOrderId) {
      // Removed getProdigiClient usage
    }

    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[ORDER_STATUS_UPDATE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
