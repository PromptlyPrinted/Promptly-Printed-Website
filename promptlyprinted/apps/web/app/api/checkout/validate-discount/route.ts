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

    // Normalize the code: trim and uppercase (codes are stored in uppercase)
    const normalizedCode = code.trim().toUpperCase();
    
    console.log('[Validate Discount] Checking code:', code);
    console.log('[Validate Discount] Normalized code:', normalizedCode);

    // Get user session if exists
    const session = await getSession(request);
    const userId = session?.user?.id;

    // Find the discount code - try multiple strategies for maximum compatibility
    let discountCode = null;
    
    // Strategy 1: Exact match with normalized (uppercase) code (most reliable)
    discountCode = await prisma.discountCode.findFirst({
      where: { 
        code: normalizedCode
      },
      include: {
        usages: userId ? {
          where: { userId },
        } : false,
      },
    });

    // Strategy 2: Case-insensitive search (if exact match failed)
    if (!discountCode) {
      discountCode = await prisma.discountCode.findFirst({
        where: { 
          code: {
            equals: normalizedCode,
            mode: 'insensitive'
          }
        },
        include: {
          usages: userId ? {
            where: { userId },
          } : false,
        },
      });
    }

    // Strategy 3: Try with original trimmed code (in case it's stored differently)
    if (!discountCode && code.trim() !== normalizedCode) {
      discountCode = await prisma.discountCode.findFirst({
        where: { 
          code: code.trim()
        },
        include: {
          usages: userId ? {
            where: { userId },
          } : false,
        },
      });
    }

    console.log('[Validate Discount] Found:', discountCode ? {
      id: discountCode.id,
      code: discountCode.code,
      isActive: discountCode.isActive,
      usedCount: discountCode.usedCount,
      maxUses: discountCode.maxUses,
    } : 'Not found');

    if (!discountCode) {
      console.error('[Validate Discount] Code not found in database:', {
        originalCode: code,
        normalizedCode: normalizedCode,
        trimmedCode: code.trim(),
      });
      
      // Try to find similar codes for better error message
      const allCodes = await prisma.discountCode.findMany({
        where: { isActive: true },
        select: { code: true },
        take: 10,
      });
      
      const availableCodes = allCodes.map(c => c.code).join(', ');
      const errorMessage = availableCodes 
        ? `Invalid discount code. Available codes: ${availableCodes}`
        : `Invalid discount code: '${code}'`;
      
      return NextResponse.json(
        { valid: false, error: errorMessage },
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
        code: discountCode.code.toUpperCase(), // Ensure uppercase for consistency
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
