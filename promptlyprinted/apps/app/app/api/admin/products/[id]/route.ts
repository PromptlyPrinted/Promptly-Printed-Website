import { auth } from '@repo/auth/server';
import { database as db } from '@repo/database';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const product = await db.product.findUnique({
      where: {
        id: Number.parseInt(id),
      },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      sku,
      description,
      price,
      customerPrice,
      currency,
      stock,
      listed,
      categoryId,
      productType,
    } = body;

    // Optional: Validate SKU with Prodigi API if environment variables are set
    if (sku && process.env.PRODIGI_API_KEY && process.env.PRODIGI_API) {
      try {
        const prodigiResponse = await fetch(
          `${process.env.PRODIGI_API}/v4.0/products/${sku}`,
          {
            headers: {
              'X-API-Key': process.env.PRODIGI_API_KEY,
            },
          }
        );

        if (!prodigiResponse.ok) {
          return new NextResponse('Invalid Prodigi SKU', { status: 400 });
        }
      } catch (error) {
        console.error('[PRODIGI_SKU_VALIDATION]', error);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (customerPrice !== undefined) updateData.customerPrice = customerPrice;
    if (currency !== undefined) updateData.currency = currency;
    if (stock !== undefined) updateData.stock = stock;
    if (listed !== undefined) updateData.listed = listed;
    if (productType !== undefined) updateData.productType = productType;
    if (categoryId !== undefined) {
      updateData.categoryId =
        categoryId === null
          ? null
          : typeof categoryId === 'string'
            ? Number.parseInt(categoryId, 10)
            : categoryId;
    }

    if (Object.keys(updateData).length === 0) {
      return new NextResponse('No fields provided to update', {
        status: 400,
      });
    }

    const product = await db.product.update({
      where: {
        id: Number.parseInt(id),
      },
      data: updateData,
    });

    revalidatePath('/admin/products');
    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const product = await db.product.delete({
      where: {
        id: Number.parseInt(id),
      },
    });

    revalidatePath('/admin/products');
    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
