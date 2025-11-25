import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import type { TrackingData } from '@/lib/tracking';

/**
 * API endpoint to store campaign attribution data
 * This helps track which campaigns drive conversions
 */
export async function POST(request: Request) {
  try {
    const trackingData: TrackingData = await request.json();

    // Get or create session ID from cookies
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID();

    // Store attribution data in database
    // You can create a CampaignAttribution table in your schema
    // For now, we'll just log it
    console.log('Campaign Attribution:', {
      sessionId,
      ...trackingData,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });

    // Optional: Store in database for later analysis
    // await database.campaignAttribution.create({
    //   data: {
    //     sessionId,
    //     utmSource: trackingData.utm_source,
    //     utmMedium: trackingData.utm_medium,
    //     utmCampaign: trackingData.utm_campaign,
    //     utmContent: trackingData.utm_content,
    //     utmTerm: trackingData.utm_term,
    //     fbclid: trackingData.fbclid,
    //     gclid: trackingData.gclid,
    //     ttclid: trackingData.ttclid,
    //     referrer: trackingData.referrer,
    //     landingPage: trackingData.landingPage,
    //   },
    // });

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Attribution tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track attribution' },
      { status: 500 }
    );
  }
}
