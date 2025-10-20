import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

interface NewsletterSubscribeRequest {
  email: string;
  campaignId?: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterSubscribeRequest = await request.json();
    const { email, campaignId = 'general', source = 'website' } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if user already has a discount code (already subscribed)
    const existingCode = await checkExistingSubscriber(email);

    if (existingCode) {
      // User already subscribed, return their existing code
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!',
        discountCode: existingCode,
        alreadySubscribed: true,
      });
    }

    // Generate personalized discount code for new subscriber
    const discountCode = await generateDiscountCode(email);

    // Subscribe to Beehiiv with discount code in custom fields
    const beehiivResponse = await subscribeToBeehiiv(email, campaignId, source, discountCode);

    if (!beehiivResponse.success) {
      // If Beehiiv says already subscribed, try to get their existing code
      if (beehiivResponse.alreadySubscribed && beehiivResponse.existingCode) {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!',
          discountCode: beehiivResponse.existingCode,
          alreadySubscribed: true,
        });
      }

      return NextResponse.json(
        { error: beehiivResponse.error || 'Failed to subscribe' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      discountCode: discountCode,
      alreadySubscribed: false,
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

async function checkExistingSubscriber(email: string): Promise<string | null> {
  try {
    // Check Stripe for existing promotion codes for this email
    const promoCodes = await stripe.promotionCodes.list({
      limit: 100,
    });

    // Find a code that matches this email in metadata
    const existingCode = promoCodes.data.find(
      (code) => code.metadata.email === email && code.metadata.source === 'newsletter_signup'
    );

    if (existingCode) {
      console.log(`Found existing discount code for ${email}: ${existingCode.code}`);
      return existingCode.code;
    }

    return null;
  } catch (error) {
    console.error('Error checking existing subscriber:', error);
    return null;
  }
}

async function generateDiscountCode(email: string): Promise<string> {
  try {
    // Create or get the WELCOME10 coupon (base coupon that all promo codes will use)
    let coupon;
    try {
      coupon = await stripe.coupons.retrieve('NEWSLETTER_WELCOME');
    } catch (error) {
      // If coupon doesn't exist, create it
      coupon = await stripe.coupons.create({
        id: 'NEWSLETTER_WELCOME',
        percent_off: 10,
        duration: 'once',
        name: 'Newsletter Welcome Discount - 10% Off',
      });
    }

    // Generate a unique, memorable code for this specific subscriber
    // Format: WELCOME-[FIRST_PART_OF_EMAIL]-[RANDOM]
    // Example: WELCOME-JOHN-X7K9
    const emailPrefix = email.split('@')[0].toUpperCase().substring(0, 6);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueCode = `WELCOME-${emailPrefix}-${randomSuffix}`;

    // Create a unique promotion code in Stripe with max_redemptions = 1
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: uniqueCode,
      max_redemptions: 1, // Can only be used once, ever
      metadata: {
        email: email,
        source: 'newsletter_signup',
        createdAt: new Date().toISOString(),
      },
    });

    console.log(`Generated unique discount code for ${email}: ${promoCode.code}`);
    return promoCode.code;
  } catch (error) {
    console.error('Error generating discount code:', error);

    // If there's an error (e.g., code already exists), try with a timestamp
    try {
      const timestamp = Date.now().toString(36).toUpperCase();
      const fallbackCode = `WELCOME-${timestamp}`;

      const promoCode = await stripe.promotionCodes.create({
        coupon: 'NEWSLETTER_WELCOME',
        code: fallbackCode,
        max_redemptions: 1,
        metadata: {
          email: email,
          source: 'newsletter_signup_fallback',
          createdAt: new Date().toISOString(),
        },
      });

      return promoCode.code;
    } catch (fallbackError) {
      console.error('Fallback code generation failed:', fallbackError);
      // As a last resort, return a generic code
      return 'WELCOME10';
    }
  }
}

async function subscribeToBeehiiv(
  email: string,
  campaignId: string,
  source: string,
  discountCode: string
): Promise<{ success: boolean; error?: string; alreadySubscribed?: boolean; existingCode?: string }> {
  try {
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.warn('Beehiiv API credentials not configured. Skipping email subscription.');
      // Return success to not break user experience, but log the warning
      return { success: true };
    }

    // Beehiiv API v2 endpoint
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: source,
          utm_campaign: campaignId,
          custom_fields: [
            {
              name: 'campaign_id',
              value: campaignId,
            },
            {
              name: 'source',
              value: source,
            },
            {
              name: 'discount_code',
              value: discountCode,
            },
          ],
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      // Handle specific Beehiiv errors
      if (response.status === 400 && responseData.errors) {
        const errorMessage = responseData.errors[0]?.message || 'Invalid request';

        // Check if error is due to duplicate email
        if (errorMessage.toLowerCase().includes('already') ||
            errorMessage.toLowerCase().includes('exist') ||
            errorMessage.toLowerCase().includes('duplicate')) {
          console.log('Email already subscribed to Beehiiv:', email);

          // Try to get their existing discount code from our Stripe records
          const existingCode = await checkExistingSubscriber(email);

          return {
            success: false,
            alreadySubscribed: true,
            existingCode: existingCode || undefined,
            error: 'You are already subscribed to our newsletter!'
          };
        }

        console.error('Beehiiv validation error:', errorMessage);
        return { success: false, error: errorMessage };
      }

      console.error('Beehiiv API error:', response.status, responseData);
      return { success: false, error: 'Failed to subscribe' };
    }

    console.log('Successfully subscribed to Beehiiv:', email);
    return { success: true };

  } catch (error) {
    console.error('Beehiiv subscription error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}
