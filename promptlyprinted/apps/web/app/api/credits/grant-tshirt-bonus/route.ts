import { NextResponse } from 'next/server';
import { grantTshirtPurchaseBonus } from '@/lib/credits';
import { getAuthContext } from '@/lib/auth-helper';

/**
 * POST /api/credits/grant-tshirt-bonus
 * Manually grant T-shirt purchase bonus credits
 *
 * This endpoint is called automatically by the Square webhook,
 * but can also be used manually for testing or admin purposes
 */
export async function POST(request: Request) {
  try {
    const authContext = await getAuthContext();

    // Require authentication
    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, tshirtCount = 1 } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Grant the bonus
    const result = await grantTshirtPurchaseBonus(
      authContext.userId,
      orderId,
      tshirtCount
    );

    return NextResponse.json({
      success: true,
      creditsGranted: result.creditsGranted,
      newBalance: result.newBalance,
      message: `Granted ${result.creditsGranted} bonus credits for ${tshirtCount} T-shirt${tshirtCount > 1 ? 's' : ''}!`,
    });

  } catch (error) {
    console.error('Error granting T-shirt bonus:', error);
    return NextResponse.json(
      {
        error: 'Failed to grant T-shirt bonus',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/credits/grant-tshirt-bonus
 * Get information about T-shirt bonus credits
 */
export async function GET() {
  return NextResponse.json({
    message: 'T-shirt Purchase Bonus System',
    bonusPerTshirt: 10,
    description: 'Get 10 bonus credits for each T-shirt you purchase!',
    grantedAutomatically: true,
    whenGranted: 'Immediately after successful payment completion',
  });
}
