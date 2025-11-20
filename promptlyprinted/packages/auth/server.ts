import 'server-only';
import { randomUUID } from 'crypto';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, twoFactor, phoneNumber, username } from 'better-auth/plugins';
import { prisma } from '@repo/database';

export const auth = betterAuth({
  // Use centralized API server for auth in production
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement password reset email sending
      console.log(`Password reset for ${user.email}: ${url}`);
    }
  },
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: Implement email verification sending
      console.log(`Email verification for ${user.email}: ${url}`);
    }
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    } : {}),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET ? {
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      }
    } : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }
    } : {}),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 minutes
    }
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === 'production'
        ? ".promptlyprinted.com"  // Production: share across subdomains
        : "localhost",            // Development: share across localhost ports
    },
    generateId: () => randomUUID(),
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production'
          ? ".promptlyprinted.com"
          : "localhost",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      }
    },
    csrfToken: {
      name: "better-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production'
          ? ".promptlyprinted.com"
          : "localhost",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
      }
    }
  },
  plugins: [
    nextCookies(),
    admin({
      defaultRole: 'CUSTOMER', // Map to your Role enum
    }),
    twoFactor(),
    phoneNumber(),
    username()
  ],
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: 'string',
        required: false,
        input: false, // Don't allow setting during registration
      }
    }
  },
  trustedOrigins: [
    // Development
    'http://localhost:3000',
    'http://localhost:3001',
    // Production
    'https://promptlyprinted.com',
    'https://app.promptlyprinted.com',
    'https://auth.promptlyprinted.com',
    'https://api.promptlyprinted.com',
    process.env.BETTER_AUTH_URL || 'http://localhost:3000'
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// For Clerk migration compatibility - will be updated in files
export const currentUser = async (request?: { headers: Headers | any }) => {
  try {
    if (request) {
      const session = await auth.api.getSession({ headers: request.headers });
      return session?.user || null;
    } else {
      const session = await auth.api.getSession({ headers: new Headers() });
      return session?.user || null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Mock clerkClient for migration compatibility - temporarily disabled
// export const clerkClient = () => {
//   throw new Error('clerkClient is deprecated. Use Prisma database queries instead.');
// };
