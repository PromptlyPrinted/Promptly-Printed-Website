import { createAuthClient } from 'better-auth/react';
import type { auth } from './server';

export const authClient = createAuthClient({
  // Each app uses its own /api/auth endpoint on the same domain
  // This is required by Better Auth - "frontend and auth server must share the same domain"
  // Sessions are shared across subdomains via:
  // 1. Same database connection
  // 2. Same BETTER_AUTH_SECRET
  // 3. Cross-subdomain cookies (domain: .promptlyprinted.com)
  baseURL: typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth`
    : process.env.BETTER_AUTH_URL
      ? `${process.env.BETTER_AUTH_URL}/api/auth`
      : 'http://localhost:3000/api/auth',
  fetchOptions: {
    credentials: 'include', // Include cookies
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