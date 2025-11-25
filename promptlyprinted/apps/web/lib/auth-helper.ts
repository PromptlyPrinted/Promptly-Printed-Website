/**
 * Authentication Helper for API Routes
 * Provides utilities to get user info and session data
 */

import { headers } from 'next/headers';
import { auth } from '@repo/auth';

export type AuthContext = {
  userId: string | null;
  sessionId: string | null;
  ipAddress: string | null;
  isAuthenticated: boolean;
};

/**
 * Get authentication context for the current request
 * Works for both authenticated users and guests
 */
export async function getAuthContext(): Promise<AuthContext> {
  // Get Better Auth session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id || null;
  const isAuthenticated = !!userId;

  // Get session ID from cookies or headers (for guest tracking)
  const headersList = await headers();
  const sessionId = headersList.get('x-session-id') || null;
  const ipAddress = headersList.get('x-forwarded-for') ||
                    headersList.get('x-real-ip') ||
                    null;

  return {
    userId,
    sessionId,
    ipAddress,
    isAuthenticated,
  };
}

/**
 * Generate a session ID from request headers
 * Used for guest user tracking
 */
export function generateSessionId(request: Request): string {
  // Try to get existing session ID from header
  const sessionIdHeader = request.headers.get('x-session-id');
  if (sessionIdHeader) {
    return sessionIdHeader;
  }

  // Generate from user agent + IP for consistency
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Create a simple hash (in production, use a proper fingerprinting library)
  const fingerprint = `${ip}-${userAgent}`;
  return Buffer.from(fingerprint).toString('base64').slice(0, 32);
}
