import { NextResponse } from 'next/server';
import { SquareClient } from 'square';
import { randomUUID } from 'crypto';
import { getAuthContext } from '@/lib/auth-helper';
import { prisma } from '@repo/database';

// Initialize Square client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? "https://connect.squareup.com" as any // Environment.Production
    : "https://connect.squareupsandbox.com" as any, // Environment.Sandbox
});

/**
 * POST /api/checkout/credits
 * Create a Square checkout session for purchasing credits
 */
export async function POST(request: Request) {
  try {
    const authContext = await getAuthContext();

    // Only authenticated users can purchase credits
    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json(
        { error: 'Authentication required to purchase credits' },
        { status: 401 }
      );
    }

    const { packId } = await request.json();

    if (!packId) {
      return NextResponse.json(
        { error: 'Pack ID is required' },
        { status: 400 }
      );
    }

    // Fetch the credit pack
    const pack = await prisma.creditPack.findUnique({
      where: { id: packId },
    });

    if (!pack || !pack.isActive) {
      return NextResponse.json(
        { error: 'Credit pack not found or inactive' },
        { status: 404 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: authContext.userId },
      select: { email: true, name: true, id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create idempotency key for Square
    const idempotencyKey = randomUUID();

    // Calculate amounts (Square uses smallest currency unit - cents)
    const amountMoney = {
      amount: BigInt(Math.round(pack.price * 100)), // Convert to cents
      currency: pack.currency,
    };

    // Build redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/checkout/credits/success?session_id={CHECKOUT_ID}`;
    const cancelUrl = `${baseUrl}/checkout/credits/cancelled`;

    // Create line item
    const totalCredits = pack.credits + pack.bonusCredits;
    const lineItems = [
      {
        name: pack.name,
        quantity: '1',
        basePriceMoney: amountMoney,
        note: `${totalCredits} AI generation credits (${pack.credits} + ${pack.bonusCredits} bonus)`,
      },
    ];

    // Create checkout via Square API
    const { result } = await squareClient.checkoutApi.createPaymentLink({
      idempotencyKey,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems,
        metadata: {
          userId: authContext.userId,
          packId: pack.id,
          credits: totalCredits.toString(),
          type: 'credit_pack_purchase',
        },
      },
      checkoutOptions: {
        redirectUrl: successUrl,
        askForShippingAddress: false,
        merchantSupportEmail: process.env.SUPPORT_EMAIL || 'support@promptlyprinted.com',
        acceptedPaymentMethods: {
          applePay: true,
          googlePay: true,
          cashAppPay: false,
        },
      },
      prePopulatedData: {
        buyerEmail: user.email,
        buyerPhoneNumber: undefined,
      },
    });

    if (!result.paymentLink) {
      throw new Error('Failed to create payment link');
    }

    // Store pending order in database for webhook processing
    await prisma.order.create({
      data: {
        userId: authContext.userId,
        status: 'PENDING',
        totalPrice: pack.price,
        metadata: {
          type: 'credit_pack_purchase',
          packId: pack.id,
          packName: pack.name,
          credits: totalCredits,
          squarePaymentLinkId: result.paymentLink.id,
          squareOrderId: result.paymentLink.orderId,
        },
        idempotencyKey,
      },
    });

    return NextResponse.json({
      checkoutUrl: result.paymentLink.url,
      paymentLinkId: result.paymentLink.id,
      orderId: result.paymentLink.orderId,
    });

  } catch (error) {
    console.error('Error creating Square checkout:', error);

    // Extract Square API error details
    let errorMessage = 'Failed to create checkout session';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';

    if (error && typeof error === 'object' && 'errors' in error) {
      const squareError = error as any;
      if (Array.isArray(squareError.errors) && squareError.errors.length > 0) {
        errorDetails = squareError.errors.map((e: any) =>
          `${e.category}: ${e.detail}`
        ).join(', ');
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
