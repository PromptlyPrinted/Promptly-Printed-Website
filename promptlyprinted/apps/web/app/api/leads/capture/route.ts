import { NextRequest, NextResponse } from 'next/server';

interface LeadCaptureRequest {
  email: string;
  campaignId: string;
  utmSource?: string;
  trigger: 'exit-intent' | 'time-based' | 'design-completed' | 'manual';
  metadata?: {
    themes: string[];
    location: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadCaptureRequest = await request.json();
    const { email, campaignId, utmSource, trigger, metadata } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Store lead in database (implement your database logic)
    const leadData = {
      email,
      campaignId,
      utmSource,
      trigger,
      metadata,
      capturedAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // TODO: Save to your database
    console.log('Lead captured:', leadData);

    // Send to email automation platform (Beehiiv/Resend)
    await sendToEmailAutomation(leadData);

    // Track conversion in PostHog
    await trackLeadCapture(leadData);

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully'
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}

async function sendToEmailAutomation(leadData: any) {
  try {
    // Example Beehiiv integration
    if (process.env.BEEHIIV_API_KEY) {
      const response = await fetch('https://api.beehiiv.com/v2/subscribers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: leadData.email,
          tags: [leadData.campaignId, leadData.trigger],
          custom_fields: {
            campaign_id: leadData.campaignId,
            utm_source: leadData.utmSource,
            themes: leadData.metadata?.themes?.join(','),
          },
        }),
      });

      if (!response.ok) {
        console.error('Beehiiv API error:', await response.text());
      }
    }

    // Example Resend integration for welcome email
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'hello@promptlyprinted.com',
          to: leadData.email,
          subject: `Welcome to ${leadData.campaignId} inspiration!`,
          html: getWelcomeEmailTemplate(leadData),
        }),
      });

      if (!response.ok) {
        console.error('Resend API error:', await response.text());
      }
    }
  } catch (error) {
    console.error('Email automation error:', error);
  }
}

async function trackLeadCapture(leadData: any) {
  try {
    // PostHog server-side tracking
    if (process.env.POSTHOG_API_KEY) {
      await fetch('https://app.posthog.com/capture/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.POSTHOG_API_KEY,
          event: 'lead_captured_server',
          properties: {
            email: leadData.email,
            campaign_id: leadData.campaignId,
            utm_source: leadData.utmSource,
            trigger: leadData.trigger,
            themes: leadData.metadata?.themes,
          },
          timestamp: leadData.capturedAt,
        }),
      });
    }
  } catch (error) {
    console.error('PostHog tracking error:', error);
  }
}

function getWelcomeEmailTemplate(leadData: any): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to ${leadData.campaignId}! 🎨</h1>

        <p>Thanks for joining thousands of creators making amazing designs!</p>

        <h2>Here's your welcome gift:</h2>
        <ul>
          <li>15% off your first order (code: WELCOME15)</li>
          <li>Weekly design inspiration</li>
          <li>Early access to new themes</li>
        </ul>

        <a href="https://promptlyprinted.com/design?utm_source=email&utm_campaign=welcome"
           style="background: #FF7900; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Start Designing →
        </a>

        <p>Happy creating!<br>The Promptly Printed Team</p>
      </body>
    </html>
  `;
}