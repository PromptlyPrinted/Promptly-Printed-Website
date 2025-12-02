import { type NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * Better Auth Webhook Handler
 *
 * Handles authentication events from Better Auth:
 * - user.created: Send welcome email and subscribe to newsletter
 * - user.updated: Update email preferences
 *
 * @see https://www.better-auth.com/docs/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    console.log('[Better Auth Webhook] Received event:', event.type);

    // Handle user creation event
    if (event.type === 'user.created') {
      const { email, name } = event.data;

      if (!email) {
        console.error('[Better Auth Webhook] No email provided in user.created event');
        return NextResponse.json(
          { success: false, error: 'No email provided' },
          { status: 400 }
        );
      }

      // Extract first name from full name
      const firstName = name ? name.split(' ')[0] : undefined;

      // Send welcome email via Resend
      console.log('[Better Auth Webhook] Sending welcome email to:', email);
      const emailResult = await sendWelcomeEmail({
        to: email,
        firstName,
      });

      if (!emailResult.success) {
        console.error('[Better Auth Webhook] Failed to send welcome email:', emailResult.error);
      } else {
        console.log('[Better Auth Webhook] Welcome email sent successfully');
      }

      // Subscribe to Beehiiv newsletter
      if (process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID) {
        console.log('[Better Auth Webhook] Adding to Beehiiv newsletter:', email);

        try {
          const beehiivResponse = await fetch(
            `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                reactivate_existing: false,
                send_welcome_email: false, // We already sent our own welcome email
                utm_source: 'website',
                utm_campaign: 'signup',
                utm_medium: 'registration',
              }),
            }
          );

          if (!beehiivResponse.ok) {
            const errorData = await beehiivResponse.json();
            console.error('[Better Auth Webhook] Beehiiv subscription failed:', errorData);
          } else {
            console.log('[Better Auth Webhook] Successfully added to Beehiiv');
          }
        } catch (beehiivError) {
          console.error('[Better Auth Webhook] Beehiiv API error:', beehiivError);
          // Don't fail the webhook if Beehiiv fails
        }
      } else {
        console.warn('[Better Auth Webhook] Beehiiv not configured, skipping newsletter subscription');
      }

      return NextResponse.json({
        success: true,
        emailSent: emailResult.success,
      });
    }

    // Handle user update event (optional)
    if (event.type === 'user.updated') {
      console.log('[Better Auth Webhook] User updated:', event.data.email);

      // TODO: Handle email preference updates if needed

      return NextResponse.json({ success: true });
    }

    // Unknown event type
    console.warn('[Better Auth Webhook] Unknown event type:', event.type);
    return NextResponse.json(
      { success: false, error: 'Unknown event type' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[Better Auth Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
