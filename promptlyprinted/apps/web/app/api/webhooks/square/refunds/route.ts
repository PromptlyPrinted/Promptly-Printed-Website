import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';
import { sendRefundCompletedEmail } from '@/lib/email';
import crypto from 'crypto';

/**
 * Square Refund Webhook Handler
 *
 * Handles refund events from Square:
 * - refund.completed - Refund was successfully processed
 * - refund.failed - Refund failed (log for manual review)
 *
 * Webhook docs: https://developer.squareup.com/docs/webhooks/overview
 */

const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

/**
 * Verify Square webhook signature
 */
function verifySquareWebhook(body: string, signature: string, notificationUrl: string): boolean {
  if (!webhookSignatureKey) {
    console.error('[Square Refund Webhook] SQUARE_WEBHOOK_SIGNATURE_KEY is not set');
    return false;
  }

  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  hmac.update(notificationUrl + body);
  const expectedSignature = 'sha256=' + hmac.digest('base64');

  return signature === expectedSignature;
}

interface SquareRefundEvent {
  merchant_id: string;
  type: string;
  event_id: string;
  created_at: string;
  data: {
    type: string;
    id: string;
    object: {
      refund: {
        id: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'COMPLETED';
        amount_money: {
          amount: number;
          currency: string;
        };
        payment_id: string;
        order_id: string;
        reason?: string;
        created_at: string;
        updated_at: string;
      };
    };
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-square-hmacsha256-signature') || '';
    const notificationUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/square/refunds`;

    // Verify webhook signature
    if (!verifySquareWebhook(body, signature, notificationUrl)) {
      console.error('[Square Refund Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: SquareRefundEvent = JSON.parse(body);

    console.log('[Square Refund Webhook] Received event:', {
      type: event.type,
      eventId: event.event_id,
      refundId: event.data?.object?.refund?.id,
      status: event.data?.object?.refund?.status,
    });

    // Only handle refund events
    if (!event.type.startsWith('refund.')) {
      console.log('[Square Refund Webhook] Ignoring non-refund event:', event.type);
      return NextResponse.json({ received: true, ignored: true });
    }

    const refund = event.data?.object?.refund;
    if (!refund) {
      console.error('[Square Refund Webhook] No refund data in event');
      return NextResponse.json({ error: 'No refund data' }, { status: 400 });
    }

    // Find refund in database
    const dbRefund = await prisma.refund.findFirst({
      where: { squareRefundId: refund.id },
      include: {
        order: {
          include: {
            recipient: true,
          },
        },
      },
    });

    if (!dbRefund) {
      console.warn('[Square Refund Webhook] Refund not found in database:', refund.id);
      // Still acknowledge the webhook to prevent retries
      return NextResponse.json({
        received: true,
        warning: 'Refund not found in database',
      });
    }

    // Update refund status
    await prisma.refund.update({
      where: { id: dbRefund.id },
      data: {
        status: refund.status,
        updatedAt: new Date(),
      },
    });

    console.log('[Square Refund Webhook] Refund status updated:', {
      refundId: refund.id,
      orderId: dbRefund.orderId,
      status: refund.status,
    });

    // Handle refund completion
    if (event.type === 'refund.completed' || refund.status === 'COMPLETED') {
      console.log('[Square Refund Webhook] Refund completed:', refund.id);

      // Send refund completion email
      const recipientEmail = dbRefund.order?.recipient?.email;
      if (recipientEmail) {
        const refundAmount = refund.amount_money.amount / 100; // Convert cents to dollars

        await sendRefundCompletedEmail({
          to: recipientEmail,
          orderNumber: dbRefund.orderId.toString(),
          refundAmount,
          refundId: refund.id,
        }).catch((err: Error) => {
          console.error('[Square Refund Webhook] Failed to send refund email:', err);
        });

        console.log('[Square Refund Webhook] Refund completion email sent to:', recipientEmail);
      }
    }

    // Handle refund failure
    if (event.type === 'refund.failed' || refund.status === 'FAILED') {
      console.error('[Square Refund Webhook] Refund FAILED:', {
        refundId: refund.id,
        orderId: dbRefund.orderId,
        reason: refund.reason,
      });

      // Update order metadata with failure info
      const order = dbRefund.order;
      if (order) {
        const metadata = (order.metadata as Record<string, unknown>) || {};
        await prisma.order.update({
          where: { id: order.id },
          data: {
            metadata: {
              ...metadata,
              refundFailed: true,
              refundFailedAt: new Date().toISOString(),
              refundFailedReason: refund.reason,
            },
          },
        });
      }

      // TODO: Notify admin of failed refund
    }

    return NextResponse.json({
      received: true,
      refundId: refund.id,
      status: refund.status,
    });
  } catch (error) {
    console.error('[Square Refund Webhook] Error processing webhook:', error);
    // Return 200 to acknowledge receipt and prevent retries
    return NextResponse.json(
      {
        received: true,
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
