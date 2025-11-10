import { auth } from '@repo/auth/server';
import { database as db } from '@repo/database';
import { headers } from 'next/headers';
import { saveProdigiQuote } from '@repo/database/utils/saveProdigiQuote';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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
