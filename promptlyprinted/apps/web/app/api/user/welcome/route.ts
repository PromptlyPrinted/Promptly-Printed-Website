import { type NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * User Welcome API
 *
 * Called immediately after user signs up to:
 * 1. Send welcome email via Resend
 * 2. Add user to Beehiiv newsletter
 *
 * This runs client-side after successful signup.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const firstName = name ? name.split(' ')[0] : undefined;

    // 1. Send welcome email via Resend
    console.log('[User Welcome] Sending welcome email to:', email);

    const emailResult = await sendWelcomeEmail({
      to: email,
      firstName,
    });

    if (!emailResult.success) {
      console.error('[User Welcome] Failed to send welcome email:', emailResult.error);
    } else {
      console.log('[User Welcome] Welcome email sent successfully');
    }

    // 2. Add to Beehiiv newsletter (if configured)
    if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
      console.log('[User Welcome] Adding to Beehiiv newsletter:', email);

      try {
        const beehiivResponse = await fetch(
          `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              reactivate_existing: false,
              send_welcome_email: false, // We already sent our own
              utm_source: 'website',
              utm_campaign: 'signup',
              utm_medium: 'registration',
            }),
          }
        );

        if (!beehiivResponse.ok) {
          const errorData = await beehiivResponse.json();
          console.error('[User Welcome] Beehiiv subscription failed:', errorData);
        } else {
          console.log('[User Welcome] Successfully added to Beehiiv');
        }
      } catch (beehiivError) {
        console.error('[User Welcome] Beehiiv API error:', beehiivError);
        // Don't fail the request if Beehiiv fails
      }
    } else {
      console.log(
        '[User Welcome] Beehiiv not configured, skipping newsletter subscription'
      );
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    console.error('[User Welcome] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
