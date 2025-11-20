import { createAuthClient } from 'better-auth/react';
import type { auth } from './server';

export const authClient = createAuthClient({
  // Use promptlyprinted.com as centralized auth server for all apps
  // Cross-subdomain cookies allow session sharing across promptlyprinted.com subdomains
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    ? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth`
    : 'http://localhost:3001/api/auth', // Default to web app (port 3001)
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