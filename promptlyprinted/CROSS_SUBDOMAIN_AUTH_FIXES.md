# Cross-Subdomain Authentication Troubleshooting Guide

## Current Issue
The admin panel at `app.promptlyprinted.com/admin` doesn't recognize the authenticated session, even though sign-in/sign-up works.

## Primary Fix (Already Applied)
Changed `sameSite` from `"none"` to `"lax"` in `/packages/auth/server.ts:78,91`

---

## Alternative Fixes (If Primary Fix Doesn't Work)

### Fix #1: Verify Environment Variables
Ensure both apps point to the same auth server in **production**:

**apps/web/.env:**
```env
NEXT_PUBLIC_BETTER_AUTH_URL="https://promptlyprinted.com"
```

**apps/app/.env:**
```env
NEXT_PUBLIC_BETTER_AUTH_URL="https://promptlyprinted.com"
```

Both should point to `promptlyprinted.com` (not `app.promptlyprinted.com`) to centralize auth.

### Fix #2: Add basePath to Client Configuration
If the apps are on different subdomains, explicitly set the base path:

**packages/auth/client.ts:**
```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth`
    : 'http://localhost:3001/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
  // Add this:
  basePath: '/api/auth',
});
```

### Fix #3: Switch Back to sameSite: "none" with Proper CORS
If you need true cross-origin cookies:

**packages/auth/server.ts:**
```typescript
cookies: {
  sessionToken: {
    name: "better-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "none", // Required for cross-origin
      secure: true,     // MUST be true when sameSite is "none"
      domain: ".promptlyprinted.com",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    }
  },
  // ... same for csrfToken
}
```

**IMPORTANT:** When using `sameSite: "none"`:
- `secure: true` is **required** (only works over HTTPS)
- Won't work in local development unless using HTTPS
- All domains must be in `trustedOrigins`

### Fix #4: Add Explicit CORS Headers (API Route Level)
Create/update the auth API route handler:

**apps/app/app/api/auth/[...all]/route.ts:**
```typescript
import { auth } from '@repo/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

const handler = toNextJsHandler(auth);

export const GET = async (request: Request) => {
  const response = await handler.GET(request);

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', 'https://promptlyprinted.com');

  return response;
};

export const POST = async (request: Request) => {
  const response = await handler.POST(request);

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', 'https://promptlyprinted.com');

  return response;
};
```

### Fix #5: Server-Side Session Forwarding
Instead of relying on cookies, fetch session server-side in the admin layout:

**apps/app/app/(authenticated)/admin/layout.tsx** (already partially implemented):
```typescript
// This is already doing the right thing!
const session = await auth.api.getSession({
  headers: requestHeaders,
  query: { disableCookieCache: true } // Forces fresh DB read
});
```

The issue might be that cookies aren't being sent. Check browser DevTools → Application → Cookies and verify:
- Cookie name: `better-auth.session-token`
- Domain: `.promptlyprinted.com`
- Path: `/`
- Secure: `true`
- SameSite: `lax` (after our fix)

### Fix #6: Middleware Cookie Forwarding
If middleware is stripping cookies, explicitly forward them:

**packages/auth/middleware.ts:**
```typescript
export async function authMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Forward all better-auth cookies
  const cookies = request.cookies.getAll();
  cookies.forEach(cookie => {
    if (cookie.name.startsWith('better-auth')) {
      response.cookies.set(cookie.name, cookie.value);
    }
  });

  // ... rest of your logic

  return response;
}
```

### Fix #7: Debugging - Add Comprehensive Logging
Add this to see exactly what's happening:

**packages/auth/server.ts** (in currentUser function):
```typescript
export const currentUser = async (request?: { headers: Headers | any }) => {
  try {
    console.log('[currentUser] Request headers:', {
      cookie: request?.headers?.get?.('cookie'),
      origin: request?.headers?.get?.('origin'),
      referer: request?.headers?.get?.('referer'),
    });

    const session = await auth.api.getSession({
      headers: request?.headers || new Headers()
    });

    console.log('[currentUser] Session result:', {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    return session?.user || null;
  } catch (error) {
    console.error('[currentUser] Error:', error);
    return null;
  }
};
```

---

## Recommended Testing Order

1. **Deploy the `sameSite: "lax"` change** ← Primary fix
2. **Check browser cookies** (DevTools → Application → Cookies)
3. **Verify environment variables** (Fix #1)
4. **If still broken, check server logs** to see what cookies are being received
5. **Try Fix #3** (`sameSite: "none"` with `secure: true`) if dealing with actual cross-origin
6. **Add debugging** (Fix #7) to identify where cookies are lost

---

## Key Configuration Points

Current working config in `/packages/auth/server.ts`:
- ✅ `crossSubDomainCookies.enabled: true`
- ✅ `crossSubDomainCookies.domain: ".promptlyprinted.com"`
- ✅ `cookies.*.domain: ".promptlyprinted.com"`
- ✅ `trustedOrigins` includes all subdomains
- ✅ `sameSite: "lax"` (newly changed)

The most likely issue is that cookies need to be re-set after deployment, so users need to sign in again.
