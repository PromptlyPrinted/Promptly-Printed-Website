import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create or get the WELCOME10 coupon
    let coupon;
    try {
      // Try to retrieve existing coupon
      coupon = await stripe.coupons.retrieve('WELCOME10');
    } catch (error) {
      // If coupon doesn't exist, create it
      coupon = await stripe.coupons.create({
        id: 'WELCOME10',
        percent_off: 10,
        duration: 'once',
        name: 'Newsletter Welcome Discount',
      });
    }

    // Create a unique promotion code for this subscriber
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: `WELCOME10-${email.split('@')[0].toUpperCase()}`, // Personalized code
      max_redemptions: 1, // Can only be used once
      metadata: {
        email: email,
        source: 'newsletter_signup',
      },
    });

    return NextResponse.json({
      success: true,
      discountCode: promoCode.code,
      discountPercent: 10,
    });

  } catch (error) {
    console.error('Error generating discount code:', error);
    return NextResponse.json(
      { error: 'Failed to generate discount code' },
      { status: 500 }
    );
  }
}
