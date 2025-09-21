import { createAuthClient } from 'better-auth/react';
import type { auth } from './server';

export const authClient = createAuthClient({
  // Always use the proxy URL for consistency
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth`
    : typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth`
    : 'http://localhost:8888/api/auth',
  fetchOptions: {
    credentials: 'include', // Include cookies in cross-origin requests
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