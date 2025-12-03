import { NextRequest, NextResponse } from 'next/server';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'better-auth.csrf_token'; // Must match server.ts cookie name (with underscore)

export function verifyCsrf(request: any) {
  const method = request.method.toUpperCase();
  // Only protect state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return { ok: true } as const;

  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[CSRF Verification]', {
      method,
      hasHeaderToken: !!headerToken,
      hasCookieToken: !!cookieToken,
      headerTokenLength: headerToken?.length || 0,
      cookieTokenLength: cookieToken?.length || 0,
      tokensMatch: headerToken === cookieToken,
      cookieName: CSRF_COOKIE,
    });
  }

  if (!headerToken || !cookieToken) {
    return {
      ok: false as const,
      error: `Invalid CSRF token: ${!headerToken ? 'missing header token' : 'missing cookie token'}`,
      status: 403,
    };
  }

  if (headerToken !== cookieToken) {
    return {
      ok: false as const,
      error: 'Invalid CSRF token: tokens do not match',
      status: 403,
    };
  }

  // Optional: basic Origin/Referer check for cross-origin requests
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const url = new URL(request.url);
      const allowedHosts = [
        'promptlyprinted.com',
        'app.promptlyprinted.com',
        'auth.promptlyprinted.com',
        'localhost:3000',
        'localhost:3001',
      ];
      if (!allowedHosts.includes(url.host) || !origin.includes(url.host)) {
        return {
          ok: false as const,
          error: 'Origin not allowed',
          status: 403,
        };
      }
    } catch {}
  }

  return { ok: true } as const;
}

