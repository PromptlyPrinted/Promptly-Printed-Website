import { getSession } from '@/lib/session-utils';
import { prisma, DiscountType } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyCsrf } from '@repo/auth/csrf';
import { z } from 'zod';

const ValidateDiscountSchema = z.object({
  code: z.string().min(1).max(50),
  orderAmount: z.number().positive(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  }
  
  try {
    const body = await request.json();

    const validation = ValidateDiscountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { code, orderAmount } = validation.data;

    // Get user session if exists
    const session = await getSession(request);
    const userId = session?.user?.id;

    // Find the discount code
    // Find the discount code (case-insensitive)
    const discountCode = await prisma.discountCode.findFirst({
      where: { 
        code: {
          equals: code.trim(),
          mode: 'insensitive'
        }
      },
      include: {
        usages: userId ? {
          where: { userId },
        } : false,
      },
    });

    if (!discountCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid discount code' },
        { status: 200 }
      );
    }

    // Validate discount code
    const now = new Date();

    // Check if active
    if (!discountCode.isActive) {
      return NextResponse.json(
        { valid: false, error: 'This discount code is no longer active' },
        { status: 200 }
      );
    }

    // Check start date
    if (discountCode.startsAt && discountCode.startsAt > now) {
      return NextResponse.json(
        { valid: false, error: 'This discount code is not yet available' },
        { status: 200 }
      );
    }

    // Check expiration
    if (discountCode.expiresAt && discountCode.expiresAt < now) {
      return NextResponse.json(
        { valid: false, error: 'This discount code has expired' },
        { status: 200 }
      );
    }

    // Check minimum order amount
    if (discountCode.minOrderAmount && orderAmount < discountCode.minOrderAmount) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order amount of £${discountCode.minOrderAmount.toFixed(2)} required`
        },
        { status: 200 }
      );
    }

    // Check max total uses
    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: 'This discount code has reached its usage limit' },
        { status: 200 }
      );
    }

    // Check max uses per user (only if user is logged in)
    if (userId && discountCode.maxUsesPerUser) {
      const userUsageCount = Array.isArray(discountCode.usages)
        ? discountCode.usages.length
        : 0;

      if (userUsageCount >= discountCode.maxUsesPerUser) {
        return NextResponse.json(
          { valid: false, error: 'You have already used this discount code' },
          { status: 200 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.type === DiscountType.PERCENTAGE) {
      discountAmount = (orderAmount * discountCode.value) / 100;
    } else if (discountCode.type === DiscountType.FIXED_AMOUNT) {
      discountAmount = Math.min(discountCode.value, orderAmount);
    }

    return NextResponse.json({
      valid: true,
      discountCode: {
        id: discountCode.id,
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        discountAmount,
      },
    });

  } catch (error: any) {
    console.error('[Validate Discount] Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
