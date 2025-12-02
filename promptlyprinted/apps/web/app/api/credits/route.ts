import { NextResponse } from 'next/server';
import { getAuthContext, generateSessionId } from '@/lib/auth-helper';
import { getCreditStats, checkGuestCredits } from '@/lib/credits';

/**
 * GET /api/credits
 * Get credit balance and usage stats for authenticated user
 * or guest generation limits for unauthenticated users
 */
export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext();

    if (authContext.isAuthenticated && authContext.userId) {
      // Return user credit stats
      const stats = await getCreditStats(authContext.userId);

      return NextResponse.json({
        authenticated: true,
        credits: {
          balance: stats.balance,
          welcomeCreditsRemaining: stats.welcomeCreditsRemaining,
          lifetimeCredits: stats.lifetimeCredits,
          lifetimeSpent: stats.lifetimeSpent,
        },
        usage: {
          totalGenerations: stats.totalGenerations,
        },
        recentTransactions: stats.recentTransactions,
      });
    } else {
      // Return guest credits
      const sessionId = authContext.sessionId || generateSessionId(request);
      const guestCheck = await checkGuestCredits(sessionId, authContext.ipAddress || undefined);

      return NextResponse.json({
        authenticated: false,
        guest: {
          remaining: guestCheck.remaining,
          total: guestCheck.total,
        },
        signupOffer: {
          credits: 50,
          message: 'Sign up for a free account to get 50 credits per month!',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching credit stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch credit information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
