import 'server-only';
import { square } from '@repo/payments';
import { prisma } from '@repo/database';

export interface RefundRequest {
  paymentId: string;
  amount: number;
  currency?: string;
  reason: string;
  orderId: number;
}

export interface RefundResponse {
  refundId: string;
  status: string;
  amount: number;
  currency: string;
}

/**
 * Process a full refund for an order cancellation
 */
export async function processFullRefund(
  request: RefundRequest
): Promise<RefundResponse> {
  console.log('[Square Refund] Processing full refund:', {
    paymentId: request.paymentId,
    amount: request.amount,
    reason: request.reason,
    orderId: request.orderId,
  });

  try {
    // Create refund in Square
    const response = await square.refunds.refundPayment({
      paymentId: request.paymentId,
      amountMoney: {
        amount: BigInt(Math.round(request.amount * 100)), // Convert to cents
        currency: request.currency || 'USD',
      },
      reason: request.reason,
      idempotencyKey: `refund-${request.orderId}-${Date.now()}`,
    });

    if (!response.result.refund) {
      throw new Error('No refund returned from Square API');
    }

    const refund = response.result.refund;

    console.log('[Square Refund] Refund created:', {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amountMoney?.amount,
    });

    // Record refund in database
    await prisma.refund.create({
      data: {
        orderId: request.orderId,
        squareRefundId: refund.id,
        amount: request.amount,
        currency: request.currency || 'USD',
        reason: request.reason,
        status: refund.status || 'PENDING',
      },
    });

    return {
      refundId: refund.id,
      status: refund.status || 'PENDING',
      amount: request.amount,
      currency: request.currency || 'USD',
    };
  } catch (error) {
    console.error('[Square Refund] Failed to process refund:', error);
    throw new Error(
      `Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Process a partial refund for shipping method downgrades
 */
export async function processPartialRefund(
  request: RefundRequest
): Promise<RefundResponse> {
  console.log('[Square Refund] Processing partial refund:', {
    paymentId: request.paymentId,
    amount: request.amount,
    reason: request.reason,
    orderId: request.orderId,
  });

  try {
    // Create partial refund in Square
    const response = await square.refunds.refundPayment({
      paymentId: request.paymentId,
      amountMoney: {
        amount: BigInt(Math.round(request.amount * 100)), // Convert to cents
        currency: request.currency || 'USD',
      },
      reason: request.reason,
      idempotencyKey: `partial-refund-${request.orderId}-${Date.now()}`,
    });

    if (!response.result.refund) {
      throw new Error('No refund returned from Square API');
    }

    const refund = response.result.refund;

    console.log('[Square Refund] Partial refund created:', {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amountMoney?.amount,
    });

    // Record refund in database
    await prisma.refund.create({
      data: {
        orderId: request.orderId,
        squareRefundId: refund.id,
        amount: request.amount,
        currency: request.currency || 'USD',
        reason: request.reason,
        status: refund.status || 'PENDING',
      },
    });

    return {
      refundId: refund.id,
      status: refund.status || 'PENDING',
      amount: request.amount,
      currency: request.currency || 'USD',
    };
  } catch (error) {
    console.error('[Square Refund] Failed to process partial refund:', error);
    throw new Error(
      `Failed to process partial refund: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get the status of a refund
 */
export async function getRefundStatus(refundId: string): Promise<string> {
  try {
    const response = await square.refunds.getPaymentRefund(refundId);
    return response.result.refund?.status || 'UNKNOWN';
  } catch (error) {
    console.error('[Square Refund] Failed to get refund status:', error);
    throw new Error(
      `Failed to get refund status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
