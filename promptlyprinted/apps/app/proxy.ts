import { authMiddleware } from '@repo/auth/middleware';
import { noseconeConfig, noseconeMiddleware } from '@repo/security/middleware';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Protect authenticated routes
    '/(authenticated|admin)/(.*)',
  ],
};

const securityHeaders = noseconeMiddleware(noseconeConfig);

export default async function proxy(request: NextRequest) {
  // First run auth middleware
  const authResponse = await authMiddleware(request);
  
  // If auth middleware returns a redirect, return it
  if (authResponse && authResponse.status >= 300 && authResponse.status < 400) {
    return authResponse;
  }
  
  // Otherwise apply security headers
  return securityHeaders(request);
}
