import { checkAdmin } from '@/lib/auth-utils';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await checkAdmin();

    const categories = await database.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await checkAdmin();

    const body = await request.json();
    const { name, description } = body;

    // Check if category with same name exists
    const existingCategory = await database.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return new NextResponse('Category with this name already exists', {
        status: 400,
      });
    }

    const category = await database.category.create({
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
    console.error('Error creating category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
