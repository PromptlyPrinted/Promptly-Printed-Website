import { checkAdmin } from '@/lib/auth-utils';
import { database as db } from '@repo/database';
import { saveProdigiQuote } from '@repo/database/utils/saveProdigiQuote';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await checkAdmin();

    const products = await db.product.findMany({
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await checkAdmin();

    const body = await request.json();
    const { quote, ...productData } = body;

    // First save the quote if provided
    let savedQuote;
    if (quote) {
      savedQuote = await saveProdigiQuote(quote);
    }

    // Then create the product with the quote relation
    const product = await db.product.create({
      data: {
        ...productData,
        quotes: savedQuote
          ? {
              connect: {
                id: savedQuote.id,
              },
            }
          : undefined,
      },
    });

    revalidatePath('/admin/products');
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const body = await request.json();
    const { quote, ...productData } = body;

    // First save the quote if provided
    let savedQuote;
    if (quote) {
      savedQuote = await saveProdigiQuote(quote);
    }

    // Then update the product with the quote relation
    const product = await db.product.update({
      where: {
        id: Number.parseInt(params.id),
      },
      data: {
        ...productData,
        quotes: savedQuote
          ? {
              connect: {
                id: savedQuote.id,
              },
            }
          : undefined,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
