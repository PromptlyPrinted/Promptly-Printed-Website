import { database } from '@repo/database';
import { auth } from '@repo/auth/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const adminUser = await database.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser) {
      return new NextResponse('User not found in database', { status: 404 });
    }

    if (adminUser.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await database.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in user GET route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const adminUser = await database.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser) {
      return new NextResponse('User not found in database', { status: 404 });
    }

    if (adminUser.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['ADMIN', 'CUSTOMER'].includes(role)) {
      return new NextResponse('Invalid role', { status: 400 });
    }

    const updatedUser = await database.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in user PATCH route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
