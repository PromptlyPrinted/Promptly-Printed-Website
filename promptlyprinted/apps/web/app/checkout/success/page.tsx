import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/get-image-url';
import { prisma } from '@repo/database';
import { env } from '@repo/env';
import { square } from '@repo/payments';
import { CheckCircle } from 'lucide-react';
import { ClearCart } from './ClearCart';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface OrderItem {
  id: number;
  assets: Array<{
    url: string;
    printArea?: string;
  }> | null;
  attributes?: {
    sku?: string;
    size?: string;
    color?: string;
    sizing?: 'fillPrintArea' | 'fitPrintArea';
    printArea?: string;
  };
  copies: number;
  price: number;
}



export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string; order_id?: string; orderId?: string }>;
}) {
  const params = await searchParams;
  const checkoutId = params.checkout_id;
  
  // orderId = our database order ID (number)
  // order_id = Square order ID (string starting with letters)
  const dbOrderId = params.orderId;
  const squareOrderId = params.order_id;

  if (!checkoutId && !squareOrderId && !dbOrderId) {
    redirect('/');
  }

  let squareOrder: any = null;
  let paymentStatus = 'unknown';

  // Get Square order details using Square order ID
  if (squareOrderId) {
    try {
      const orderResponse = await square.orders.get({ orderId: squareOrderId });
      squareOrder = orderResponse.order;
      // Check if order has payment
      if (squareOrder?.tenders && squareOrder.tenders.length > 0) {
        paymentStatus = squareOrder.tenders[0].cardDetails ? 'paid' : 'pending';
      }
    } catch (error) {
      console.error('Error retrieving Square order:', error);
      redirect('/');
    }
  }

  // Update order status if payment was successful
  if (paymentStatus === 'paid' && squareOrder?.metadata?.orderId) {
    try {
      const dbOrderId = Number.parseInt(squareOrder.metadata.orderId);

      // First, check if a payment with this Square order ID already exists
      const existingPayment = await prisma.payment.findUnique({
        where: { stripeId: squareOrderId },
      });

      // Get fulfillment info from Square order (shipping address)
      const fulfillment = squareOrder.fulfillments?.[0];
      const shipmentDetails = fulfillment?.shipmentDetails;
      const recipient = shipmentDetails?.recipient;

      if (existingPayment) {

        // Update the order recipient details only
        // We do NOT update status or create payment here to avoid race conditions with the webhook
        await prisma.order.update({
          where: {
            id: dbOrderId,
          },
          data: {
            recipient: {
              update: {
                name: recipient?.displayName || 'Pending',
                email: recipient?.emailAddress || 'pending@example.com',
                phoneNumber: recipient?.phoneNumber || undefined,
                addressLine1: recipient?.address?.addressLine1 || 'Pending',
                addressLine2: recipient?.address?.addressLine2 || undefined,
                postalCode: recipient?.address?.postalCode || '00000',
                countryCode: recipient?.address?.country || 'US',
                city: recipient?.address?.locality || 'Pending',
                state: recipient?.address?.administrativeDistrictLevel1 || undefined,
              },
            },
          },
        });
      } else {
        // Update the order recipient details only
        // We do NOT update status or create payment here to avoid race conditions with the webhook
        await prisma.order.update({
          where: {
            id: dbOrderId,
          },
          data: {
            recipient: {
              update: {
                name: recipient?.displayName || 'Pending',
                email: recipient?.emailAddress || 'pending@example.com',
                phoneNumber: recipient?.phoneNumber || undefined,
                addressLine1: recipient?.address?.addressLine1 || 'Pending',
                addressLine2: recipient?.address?.addressLine2 || undefined,
                postalCode: recipient?.address?.postalCode || '00000',
                countryCode: recipient?.address?.country || 'US',
                city: recipient?.address?.locality || 'Pending',
                state: recipient?.address?.administrativeDistrictLevel1 || undefined,
              },
            },
          },
        });
      }

      // Add to Resend Audience (Marketing)
      if (env.RESEND_AUDIENCE_ID && recipient?.emailAddress) {
        try {
          if (env.RESEND_API_KEY) {
             await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: recipient.emailAddress,
                first_name: recipient.displayName?.split(' ')[0],
                last_name: recipient.displayName?.split(' ').slice(1).join(' '),
                unsubscribed: false,
              }),
            });
          }
        } catch (err) {
          console.error('Failed to add customer to Resend Audience:', err);
        }
      }

    } catch (error) {
      console.error('Error updating order:', error);
      // Log the error for monitoring
      await prisma.log.create({
        data: {
          level: 'ERROR',
          message: 'Failed to update order after payment',
          metadata: {
            squareOrderId: squareOrderId,
            dbOrderId: squareOrder?.metadata?.orderId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
        },
      });
    }
  }

  return (
    <div className="container mx-auto py-20 text-center">
      <ClearCart />
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-4 font-bold text-4xl">Thank You!</h1>
          <p className="text-muted-foreground">
            Your order has been successfully placed. We'll send you an email
            with your order details.
          </p>
          {paymentStatus === 'paid' && squareOrder?.metadata?.orderId && (
            <p className="mt-4 text-yellow-600">
              Your payment was successful, but there was an issue processing
              your order. Our team has been notified and will handle this for
              you.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Link href="/orders">
            <Button variant="outline" className="w-full">
              View Order Status
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


