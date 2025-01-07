import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { role: true },
    });

    if (!adminUser) {
      return new NextResponse('User not found in database', { status: 404 });
    }

    if (adminUser.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
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
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
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