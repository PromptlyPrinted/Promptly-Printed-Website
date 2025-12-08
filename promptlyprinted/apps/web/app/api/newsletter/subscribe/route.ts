import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// Newsletter subscription API
// Creates unique discount code for email subscribers

export async function POST(request: NextRequest) {
  try {
    const { email, campaignId } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if a discount code already exists for this email (search by metadata)
    const existingDiscount = await prisma.discountCode.findFirst({
      where: {
        metadata: {
          path: ['subscriberEmail'],
          equals: normalizedEmail,
        },
      },
    });

    if (existingDiscount) {
      // Already subscribed - return their existing discount code
      return NextResponse.json({
        success: true,
        discountCode: existingDiscount.code,
        alreadySubscribed: true,
        message: 'Welcome back! Here\'s your discount code.',
      });
    }

    // Generate a unique discount code
    const discountCode = `WELCOME${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the discount code in the database
    await prisma.discountCode.create({
      data: {
        code: discountCode,
        type: 'PERCENTAGE',
        value: 10, // 10% off
        maxUses: 1,
        usedCount: 0,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
        metadata: {
          subscriberEmail: normalizedEmail,
          campaignId: campaignId || 'general',
          source: 'newsletter_signup',
        },
      },
    });

    console.log(`[Newsletter] New subscriber: ${normalizedEmail}, code: ${discountCode}, campaign: ${campaignId}`);

    return NextResponse.json({
      success: true,
      discountCode,
      alreadySubscribed: false,
      message: 'Thanks for subscribing! Here\'s your discount code.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
