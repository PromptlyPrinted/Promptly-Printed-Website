import { checkAdmin } from '@/lib/auth-utils';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const category = await database.category.findUnique({
      where: { id: Number.parseInt(params.id) },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const body = await request.json();
    const { name, description } = body;

    // Check if another category with the same name exists
    const existingCategory = await database.category.findFirst({
      where: {
        name,
        NOT: {
          id: Number.parseInt(params.id),
        },
      },
    });

    if (existingCategory) {
      return new NextResponse('Category with this name already exists', {
        status: 400,
      });
    }

    const category = await database.category.update({
      where: { id: Number.parseInt(params.id) },
      data: {
        name,
        description,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    // Check if category has products
    const category = await database.category.findUnique({
      where: { id: Number.parseInt(params.id) },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    if (category._count.products > 0) {
      return new NextResponse(
        'Cannot delete category with associated products',
        { status: 400 }
      );
    }

    await database.category.delete({
      where: { id: Number.parseInt(params.id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
