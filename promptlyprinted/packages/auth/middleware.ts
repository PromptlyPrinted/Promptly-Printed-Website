import { NextRequest, NextResponse } from 'next/server';

export async function authMiddleware(request: NextRequest) {
  // Better Auth used underscore-separated cookie names historically, so we
  // check both just in case to keep session detection consistent across apps.
  const sessionToken =
    request.cookies.get('better-auth.session-token') ??
    request.cookies.get('better-auth.session_token');
  const hasSession = !!sessionToken;

  // Define protected routes - root path should be protected too since it's in the authenticated layout
  const protectedRoutes = ['/', '/admin', '/dashboard', '/profile', '/my-images', '/my-designs', '/orders', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || (route !== '/' && request.nextUrl.pathname.startsWith(route))
  );

  // If trying to access protected route without session, redirect to sign-in
  if (isProtectedRoute && !hasSession) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If signed in and trying to access sign-in/sign-up, redirect to dashboard
  if (hasSession) {
    const authRoutes = ['/sign-in', '/sign-up'];
    const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);
    
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
