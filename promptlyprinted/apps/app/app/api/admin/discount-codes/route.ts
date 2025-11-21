import { auth } from '@repo/auth/server';
import { prisma, DiscountType, Role } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateDiscountCodeSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

// Middleware to check if user is admin
async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  return null;
}

// GET - List all discount codes
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const discountCodes = await prisma.discountCode.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: { usages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ discountCodes });
  } catch (error) {
    console.error('[Admin Discount Codes] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    );
  }
}

// POST - Create a new discount code
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validation = CreateDiscountCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if code already exists
    const existing = await prisma.discountCode.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A discount code with this code already exists' },
        { status: 400 }
      );
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type as DiscountType,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
        metadata: data.metadata || {},
      },
    });

    return NextResponse.json({ discountCode }, { status: 201 });
  } catch (error) {
    console.error('[Admin Discount Codes] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    );
  }
}

// PATCH - Update a discount code
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Discount code ID is required' },
        { status: 400 }
      );
    }

    const discountCode = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(updates.isActive !== undefined && { isActive: updates.isActive }),
        ...(updates.maxUses !== undefined && { maxUses: updates.maxUses }),
        ...(updates.maxUsesPerUser !== undefined && { maxUsesPerUser: updates.maxUsesPerUser }),
        ...(updates.expiresAt !== undefined && {
          expiresAt: updates.expiresAt ? new Date(updates.expiresAt) : null
        }),
      },
    });

    return NextResponse.json({ discountCode });
  } catch (error) {
    console.error('[Admin Discount Codes] PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update discount code' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a discount code
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Discount code ID is required' },
        { status: 400 }
      );
    }

    await prisma.discountCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Discount Codes] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete discount code' },
      { status: 500 }
    );
  }
}
