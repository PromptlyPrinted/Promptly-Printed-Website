import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/get-image-url';
import { prodigiService } from '@/lib/prodigi';
import { prisma } from '@repo/database';
import { env } from '@repo/env';
import { Client as SquareClient, Environment } from 'square';
import { CheckCircle } from 'lucide-react';
import { ClearCart } from './ClearCart';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});

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

interface ProdigiOrderItem {
  sku: string;
  copies: number;
  merchantReference?: string;
  sizing?: 'fillPrintArea' | 'fitPrintArea';
  attributes?: {
    color: string;
    size: string;
  };
  recipientCost?: {
    amount: string;
    currency: string;
  };
  assets: Array<{
    printArea: string;
    url: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string; order_id?: string }>;
}) {
  const params = await searchParams;
  const checkoutId = params.checkout_id;
  const orderId = params.order_id;

  if (!checkoutId && !orderId) {
    redirect('/');
  }

  let squareOrder: any = null;
  let paymentStatus = 'unknown';

  // Get Square order details
  if (orderId) {
    try {
      const orderResponse = await squareClient.ordersApi.retrieveOrder(orderId);
      squareOrder = orderResponse.result.order;
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
        where: { stripeId: orderId },
      });

      // Get fulfillment info from Square order (shipping address)
      const fulfillment = squareOrder.fulfillments?.[0];
      const shipmentDetails = fulfillment?.shipmentDetails;
      const recipient = shipmentDetails?.recipient;

      if (existingPayment) {
        console.log('Payment already exists for Square order:', orderId);
        // Update the order without creating a new payment
        const order = await prisma.order.update({
          where: {
            id: dbOrderId,
          },
          data: {
            status: 'COMPLETED',
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
          include: {
            recipient: true,
            orderItems: true,
          },
        });

        // Continue with Prodigi order creation...
        await handleProdigiOrderCreation(order, squareOrder);
      } else {
        // Create new payment record
        const totalMoney = squareOrder.totalMoney;
        const order = await prisma.order.update({
          where: {
            id: dbOrderId,
          },
          data: {
            status: 'COMPLETED',
            payment: {
              create: {
                stripeId: orderId!, // Using same field for now
                status: 'completed',
                amount: totalMoney ? Number(totalMoney.amount) / 100 : 0,
                currency: totalMoney?.currency?.toLowerCase() || 'usd',
              },
            },
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
          include: {
            recipient: true,
            orderItems: true,
          },
        });

        // Continue with Prodigi order creation...
        await handleProdigiOrderCreation(order, squareOrder);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      // Log the error for monitoring
      await prisma.log.create({
        data: {
          level: 'ERROR',
          message: 'Failed to update order after payment',
          metadata: {
            squareOrderId: orderId,
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

// Helper function to handle Prodigi order creation
async function handleProdigiOrderCreation(order: any, squareOrder: any) {
  if (!order.recipient) {
    console.error('No recipient found for order:', order.id);
    return;
  }

  try {
    console.log('Starting Prodigi order creation for order:', order.id);
    console.log('Order details:', {
      id: order.id,
      recipient: order.recipient,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        sku: item.attributes?.sku || 'UNKNOWN',
        copies: item.copies,
        assets: item.assets,
      })),
    });

    if (!env.PRODIGI_API_KEY) {
      throw new Error(
        'PRODIGI_API_KEY is not defined in environment variables'
      );
    }

    // Prepare items with images
    const items = await Promise.all(
      order.orderItems.map(async (item: any) => {
        const itemSku = item.attributes?.sku;
        if (!itemSku) {
          console.error('No SKU found in item attributes:', item.attributes);
          throw new Error(`No SKU found for order item: ${item.id}`);
        }

        console.log(
          'Processing item:',
          item.id,
          'with SKU:',
          itemSku
        );
        console.log('Item assets:', item.assets);

        // FOR DEVELOPMENT ONLY: Hardcode test image URL
        // TODO: In production, use actual uploaded images from cloud storage
        const imageUrl = 'https://pwintyimages.blob.core.windows.net/samples/stars/test-sample-grey.png';
        console.log('Using hardcoded test image URL for development:', imageUrl);

        // Map size to valid Prodigi size values
        const sizeMap: Record<string, string> = {
          XXS: '2xs',
          XS: 'xs',
          S: 's',
          M: 'm',
          L: 'l',
          XL: 'xl',
          XXL: '2xl',
          XXXL: '3xl',
          XXXXL: '4xl',
          XXXXXL: '5xl',
        };

        const itemSize = item.attributes?.size || 'M';
        const itemColor = item.attributes?.color || 'white';
        const prodigiSize = sizeMap[itemSize] || 'm';

        const prodigiItem: ProdigiOrderItem = {
          sku: itemSku,
          copies: item.copies,
          merchantReference: `item_${item.id}`,
          sizing: (item.attributes?.sizing || 'fillPrintArea') as
            | 'fillPrintArea'
            | 'fitPrintArea',
          attributes: {
            color: itemColor.replace(/-/g, ' '),
            size: prodigiSize,
          },
          recipientCost: {
            amount: item.price.toString(),
            currency: squareOrder.totalMoney?.currency || 'USD',
          },
          assets: [
            {
              printArea: item.attributes?.printArea || 'front',
              url: imageUrl,
            },
          ],
        };

        return prodigiItem;
      })
    );

    console.log('Prepared items for Prodigi order:', items);

    // FINAL DEBUG: Log the exact URLs being sent to Prodigi
    items.forEach((item, index) => {
      console.log(`[FINAL CHECK] Item ${index} URL:`, item.assets[0].url);
      console.log(`[FINAL CHECK] Item ${index} URL includes localhost:`, item.assets[0].url.includes('localhost'));
    });

    const prodigiOrder = await prodigiService.createOrder({
      shippingMethod: 'Standard',
      merchantReference: `order_${order.id}`,
      idempotencyKey: `order_${order.id}_${Date.now()}`,
      callbackUrl: `${env.NEXT_PUBLIC_WEB_URL}/api/webhooks/prodigi`,
      recipient: {
        name: order.recipient.name,
        email: order.recipient.email || '',
        phoneNumber: order.recipient.phoneNumber || undefined,
        address: {
          line1: order.recipient.addressLine1,
          line2: order.recipient.addressLine2 || undefined,
          postalOrZipCode: order.recipient.postalCode,
          countryCode: order.recipient.countryCode,
          townOrCity: order.recipient.city,
          stateOrCounty: order.recipient.state || undefined,
        },
      },
      items,
      metadata: {
        orderId: order.id,
        userId: order.userId,
        squareOrderId: squareOrder.id,
      },
    });

    console.log('Created Prodigi order:', prodigiOrder);

    // Update order with Prodigi order ID and status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        prodigiOrderId: prodigiOrder.order?.id,
        prodigiCreatedAt: new Date(),
        prodigiLastUpdated: new Date(),
        prodigiStage: prodigiOrder.outcome || 'OnHold',
        prodigiStatusJson: prodigiOrder,
        outcome: prodigiOrder.outcome,
      },
    });

    console.log('Updated order with Prodigi details');
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    const rawStack = error instanceof Error ? error.stack : undefined;
    const truncate = (value: string | undefined, max = 2000) =>
      value && value.length > max
        ? `${value.slice(0, max)}… [truncated]`
        : value;
    const safeMessage = truncate(rawMessage, 1000) ?? 'Unknown error';
    const safeStack = truncate(rawStack);

    console.error('Failed to create Prodigi order:', error);
    console.error('Error details:', {
      message: safeMessage,
      stack: safeStack,
      orderId: order.id,
      env: {
        hasProdigiApiKey: !!env.PRODIGI_API_KEY,
        prodigiApiKeyLength: env.PRODIGI_API_KEY?.length,
      },
    });
    // Log the error for monitoring
    await prisma.log.create({
      data: {
        level: 'ERROR',
        message: 'Failed to create Prodigi order',
        metadata: {
          orderId: order.id,
          error: safeMessage,
          stack: safeStack,
          env: {
            hasProdigiApiKey: !!env.PRODIGI_API_KEY,
            prodigiApiKeyLength: env.PRODIGI_API_KEY?.length,
          },
        },
      },
    });

    // Update order status to indicate Prodigi order creation failed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELED',
        prodigiStatusJson: {
          error: safeMessage,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }
}
