import { createAuthClient } from 'better-auth/react';
import type { auth } from './server';

export const authClient = createAuthClient({
  // Use local auth endpoints - each app has its own /api/auth route
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth`
    : typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth` // Use current app's auth endpoint
      : 'http://localhost:3000/api/auth', // Fallback for SSR
  fetchOptions: {
    credentials: 'include', // Include cookies for session sharing
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

// Export components for backward compatibility
export { UserButton } from './components/user-button';
export const OrganizationSwitcher = () => null; // Not needed since no orgs

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;