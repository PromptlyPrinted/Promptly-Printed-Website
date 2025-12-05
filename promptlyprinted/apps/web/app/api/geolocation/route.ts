import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for ipapi.co to avoid CORS issues
 * This endpoint fetches geolocation data server-side and returns it to the client
 */
export async function GET(request: NextRequest) {
  try {
    // Get client IP from request headers (respects X-Forwarded-For for proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || '';

    // Fetch from ipapi.co
    const ipapiUrl = clientIp 
      ? `https://ipapi.co/${clientIp}/json/`
      : 'https://ipapi.co/json/';

    const response = await fetch(ipapiUrl, {
      headers: {
        'User-Agent': 'PromptlyPrinted/1.0',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.error('[Geolocation] ipapi.co returned error:', response.status);
      // Return default/fallback data
      return NextResponse.json({
        country_code: 'US',
        country_name: 'United States',
        error: 'Geolocation service unavailable',
      });
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[Geolocation] Error fetching geolocation:', error);
    
    // Return default/fallback data on error
    return NextResponse.json({
      country_code: 'US',
      country_name: 'United States',
      error: 'Failed to detect location',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  }
}


