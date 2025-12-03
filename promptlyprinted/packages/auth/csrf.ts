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
  // Note: Same-origin requests (no origin header) are always allowed
  const origin = request.headers.get('origin');
  
  // If no origin header, it's a same-origin request - allow it
  if (!origin) {
    return { ok: true } as const;
  }
  
  // Only validate origin for cross-origin requests
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    
    // Define allowed origins (protocol + host)
    const allowedOrigins = [
      'https://promptlyprinted.com',
      'https://www.promptlyprinted.com',
      'https://app.promptlyprinted.com',
      'https://auth.promptlyprinted.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    
    // Check if origin matches request host (same-origin)
    const isSameOrigin = originUrl.host === requestUrl.host && 
                         originUrl.protocol === requestUrl.protocol;
    
    // Check if origin is in allowed list
    const isAllowedOrigin = allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        return originUrl.protocol === allowedUrl.protocol && 
               originUrl.host === allowedUrl.host;
      } catch {
        return false;
      }
    });
    
    // Allow if same-origin OR in allowed list
    if (isSameOrigin || isAllowedOrigin) {
      return { ok: true } as const;
    }
    
    // Block if neither same-origin nor in allowed list
    if (process.env.NODE_ENV === 'development') {
      console.log('[CSRF] Origin check failed:', {
        origin,
        requestHost: requestUrl.host,
        requestProtocol: requestUrl.protocol,
        isAllowedOrigin,
        isSameOrigin,
      });
    }
    return {
      ok: false as const,
      error: `Origin not allowed: ${origin}`,
      status: 403,
    };
  } catch (error) {
    // If URL parsing fails, log but allow the request (might be a proxy/CDN issue)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CSRF] Failed to parse origin URL:', origin, error);
    }
    // Allow the request to proceed if we can't parse the origin
    // This prevents false positives from proxy/CDN configurations
    return { ok: true } as const;
  }

  return { ok: true } as const;
}

