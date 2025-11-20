import { NextRequest, NextResponse } from 'next/server';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'better-auth.csrf-token';

export function verifyCsrf(request: NextRequest) {
  const method = request.method.toUpperCase();
  // Only protect state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return { ok: true } as const;

  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 }),
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
          response: NextResponse.json({ message: 'Origin not allowed' }, { status: 403 }),
        };
      }
    } catch {}
  }

  return { ok: true } as const;
}

