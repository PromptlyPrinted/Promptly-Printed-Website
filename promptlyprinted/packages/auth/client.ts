import { createAuthClient } from 'better-auth/react';
import type { auth } from './server';

export const authClient = createAuthClient({
  // Each app uses its own local auth endpoint
  // This is required by Better Auth for cookie-based sessions to work properly
  // All endpoints share the same database and secret for session consistency
  baseURL: typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth` // Use current domain's auth endpoint
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL
      ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth`
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