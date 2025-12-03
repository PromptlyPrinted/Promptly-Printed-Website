import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const CSRF_COOKIE = 'better-auth.csrf_token';
const CSRF_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  domain: process.env.NODE_ENV === 'production' ? '.promptlyprinted.com' : undefined,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function GET(request: NextRequest) {
  try {
    // Check if CSRF token cookie exists
    let token = request.cookies.get(CSRF_COOKIE)?.value;
    
    // If token doesn't exist, generate a new one (matching better-auth's format)
    // Better-auth uses UUID format for CSRF tokens
    if (!token || token.trim() === '') {
      token = randomUUID();
      console.log('[CSRF] Generating new CSRF token (cookie was missing)');
    }
    
    // Create response with token
    const response = NextResponse.json({ csrfToken: token });
    
    // Always set/refresh the cookie to ensure it's properly configured
    // This ensures the cookie is set with correct domain/path/secure settings
    response.cookies.set(CSRF_COOKIE, token, CSRF_COOKIE_OPTIONS);
    
    return response;
  } catch (error) {
    console.error('[CSRF] Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve CSRF token' },
      { status: 500 }
    );
  }
}

