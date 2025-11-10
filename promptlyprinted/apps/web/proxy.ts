import { noseconeConfig, noseconeMiddleware } from '@repo/security/middleware';
import type { NextRequest } from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // matcher: ['/((?!_next/static|_next/image|ingest|favicon.ico).*)'],
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Exclude checkout success page from authentication
    '/((?!checkout/success).*)',
  ],
};

const securityHeaders = noseconeMiddleware(noseconeConfig);

export default function proxy(request: NextRequest) {
  // For apps/web (customer-facing), we don't redirect users away from customer pages
  // The authentication state is handled by the UI components and API routes
  // Only apply security headers for web app
  return securityHeaders(request);
}
