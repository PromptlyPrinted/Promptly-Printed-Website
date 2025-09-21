import 'server-only';

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, twoFactor, phoneNumber, username } from 'better-auth/plugins';
import { prisma } from '@repo/database';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8888',
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
    useSecureCookies: false, // Disable for localhost development
    cookiePrefix: "better-auth", // Match existing cookies
    crossSubDomainCookies: {
      enabled: true,
      domain: "localhost", // Set explicit domain for localhost
    },
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
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8888', // Add proxy URL
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