import { auth } from '@repo/auth/server';
import type { NextRequest } from 'next/server';

/**
 * Get session from Better Auth
 * Works with both Next.js Request and standard Request objects
 */
export async function getSession(req: NextRequest | Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}
