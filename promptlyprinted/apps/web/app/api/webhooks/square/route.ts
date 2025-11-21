import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';
import { prodigiService } from '@/lib/prodigi';

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;

// Verify Square webhook signature
function verifySquareWebhook(body: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  const hash = hmac.update(body).digest('base64');
  return hash === signature;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('x-square-hmacsha256-signature');

    if (!signature) {
      console.error('No signature provided in webhook');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifySquareWebhook(body, signature)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle refund events
    if (event.type === 'refund.created' || event.type === 'refund.updated') {
      const refund = event.data.object.refund;

      // Only process completed refunds
      if (refund.status !== 'COMPLETED' && refund.status !== 'PENDING') {
        console.log('Refund not in processable state:', refund.status);
        return NextResponse.json({ received: true });
      }

      const paymentId = refund.payment_id;

      if (!paymentId) {
        console.error('No payment ID found in refund');
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Find the order by Square payment/order ID
      const order = await prisma.order.findFirst({
        where: {
          stripeSessionId: paymentId, // Using same field for Square order ID
        },
      });

      if (!order) {
        console.error('No order found for payment ID:', paymentId);
        return NextResponse.json({ error: 'Order not found' }, { status: 400 });
      }

      // Update order status to CANCELED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELED,
        },
      });

      console.log('Order refunded:', {
        orderId: order.id,
        refundId: refund.id,
        amount: refund.amount_money,
      });

      return NextResponse.json({ received: true });
    }

    // Handle payment.updated event (when payment is completed)
    if (event.type === 'payment.updated' || event.type === 'payment.created') {
      const payment = event.data.object.payment;

      // Check if payment is completed
      if (payment.status !== 'COMPLETED') {
        console.log('Payment not completed yet:', payment.status);
        return NextResponse.json({ received: true });
      }

      // Get order ID from payment metadata or order ID
      const orderId = payment.order_id;

      if (!orderId) {
        console.error('No order ID found in payment');
        return NextResponse.json({ error: 'No order ID' }, { status: 400 });
      }

      // Retrieve the Square order to get metadata
      const squareOrderResponse = await squareClient.orders.get({ orderId });
      const squareOrder = squareOrderResponse.order;

      if (!squareOrder || !squareOrder.metadata) {
        console.error('No metadata found in Square order');
        return NextResponse.json({ error: 'No metadata' }, { status: 400 });
      }

      const isGuestCheckout = squareOrder.metadata.isGuestCheckout === 'true';

      // Handle guest checkout - create user and order
      if (isGuestCheckout) {
        console.log('Processing guest checkout order');

        // Parse order data from metadata
        const orderData = JSON.parse(squareOrder.metadata.orderData || '{}');

        // Get customer email from payment (Square doesn't always include customer info in webhook)
        // You may need to retrieve this from the payment customer_id
        let customerEmail = payment.buyer_email_address;

        if (!customerEmail) {
          console.error('No email found for guest checkout');
          return NextResponse.json(
            { error: 'No email found' },
            { status: 400 }
          );
        }

        // Find or create guest user
        let user = await prisma.user.findUnique({
          where: { email: customerEmail },
        });

        if (!user) {
          // Create new guest user
          user = await prisma.user.create({
            data: {
              email: customerEmail,
              name: 'Guest User',
              emailVerified: false,
              role: 'CUSTOMER',
            },
          });
          console.log('Created new guest user:', user.id);
        } else {
          console.log('Found existing user:', user.id);
        }

        // Create order for guest user
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            totalPrice: orderData.totalPrice,
            status: OrderStatus.COMPLETED,
            stripeSessionId: orderId, // Using same field for now
            merchantReference: `ORDER-${Date.now()}`,
            shippingMethod: 'STANDARD',
            recipient: {
              create: {
                name: 'Pending', // Will be updated when shipping address is available
                email: customerEmail,
                phoneNumber: null,
                addressLine1: 'Pending',
                addressLine2: null,
                city: 'Pending',
                state: null,
                postalCode: '00000',
                countryCode: 'US',
              },
            },
            orderItems: {
              create: orderData.items.map((item: any) => ({
                productId: item.productId,
                copies: item.copies || 1,
                price: item.price,
                merchantReference: item.merchantReference || `item #${item.productId}`,
                recipientCostAmount: item.recipientCostAmount || item.price,
                recipientCostCurrency: item.currency || 'USD',
                attributes: {
                  sku: item.sku,
                  color: item.color,
                  size: item.size,
                  designUrl: item.designUrl,
                },
                assets: item.images || [],
              })),
            },
          },
        });

        console.log('Created guest order:', order.id);
        return NextResponse.json({ received: true, orderId: order.id });
      }

      // Handle authenticated user checkout
      if (!squareOrder.metadata.orderId) {
        console.error('No orderId found in order metadata');
        return NextResponse.json(
          { error: 'No orderId found' },
          { status: 400 }
        );
      }

      const dbOrderId = Number.parseInt(squareOrder.metadata.orderId);

      // Update the order status
      const updatedOrder = await prisma.order.update({
        where: { id: dbOrderId },
        data: {
          status: OrderStatus.COMPLETED,
          metadata: {
            squarePaymentId: payment.id,
            squarePaymentStatus: payment.status,
            squareOrderId: orderId,
          },
        },
        include: {
          recipient: true,
          discountCode: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      console.log('Updated order:', {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
      });

      // Record discount usage if discount was applied
      if (updatedOrder.discountCodeId && updatedOrder.discountAmount && updatedOrder.discountAmount > 0) {
        try {
          // Check if usage already recorded (prevent duplicates)
          const existingUsage = await prisma.discountUsage.findFirst({
            where: {
              discountCodeId: updatedOrder.discountCodeId,
              orderId: updatedOrder.id,
            },
          });

          if (!existingUsage) {
            await prisma.$transaction([
              // Create discount usage record
              prisma.discountUsage.create({
                data: {
                  discountCodeId: updatedOrder.discountCodeId,
                  orderId: updatedOrder.id,
                  userId: updatedOrder.userId !== 'guest' ? updatedOrder.userId : undefined,
                  discountAmount: updatedOrder.discountAmount,
                },
              }),
              // Increment the used count
              prisma.discountCode.update({
                where: { id: updatedOrder.discountCodeId },
                data: { usedCount: { increment: 1 } },
              }),
            ]);
            console.log('[Discount] Usage recorded via webhook', {
              discountCode: updatedOrder.discountCode?.code,
              discountAmount: updatedOrder.discountAmount,
            });
          } else {
            console.log('[Discount] Usage already recorded, skipping', {
              discountCode: updatedOrder.discountCode?.code,
            });
          }
        } catch (discountError) {
          console.error('[Discount] Failed to record usage via webhook:', discountError);
          // Don't fail the webhook if discount tracking fails
        }
      }

      // Create Prodigi order now that payment is completed
      try {
        console.log('[Prodigi Order] Starting creation from webhook...', {
          orderId: updatedOrder.id,
          itemCount: updatedOrder.orderItems.length,
        });

        // Prepare Prodigi order items
        const prodigiItems = updatedOrder.orderItems.map((orderItem, index) => {
          const sku = orderItem.product?.sku;
          if (!sku) {
            throw new Error(`Product SKU not found for order item ID: ${orderItem.id}`);
          }

          // Get design URL from order item assets
          let designUrl: string | undefined;
          const assets = orderItem.assets;

          if (assets && typeof assets === 'object' && !Array.isArray(assets)) {
            designUrl = (assets as any).url;
          } else if (Array.isArray(assets) && assets.length > 0) {
            designUrl = (assets[0] as any).url;
          }

          // Also check attributes for designUrl
          if (!designUrl && orderItem.attributes) {
            const attrs = orderItem.attributes as any;
            designUrl = attrs.designUrl || attrs.design_url;
          }

          if (!designUrl) {
            console.error('[Prodigi Order] Missing design URL:', {
              orderItemId: orderItem.id,
              orderItemAssets: assets,
              orderItemAttributes: orderItem.attributes,
            });
            throw new Error(`Design URL missing for order item. Please ensure all products have custom designs uploaded.`);
          }

          console.log('[Prodigi Order] Item prepared:', {
            index,
            sku,
            copies: orderItem.copies,
            hasDesignUrl: !!designUrl,
          });

          return {
            sku: sku,
            copies: orderItem.copies,
            merchantReference: `item_${updatedOrder.id}_${index}`,
            sizing: 'fillPrintArea' as const,
            assets: [
              {
                printArea: 'default',
                url: designUrl,
              },
            ],
          };
        });

        console.log('[Prodigi Order] All items prepared successfully:', {
          itemCount: prodigiItems.length,
        });

        // Create Prodigi order
        const prodigiOrderRequest = {
          shippingMethod: 'Standard' as const,
          recipient: {
            name: updatedOrder.recipient.name,
            email: updatedOrder.recipient.email,
            phoneNumber: updatedOrder.recipient.phoneNumber || undefined,
            address: {
              line1: updatedOrder.recipient.addressLine1,
              line2: updatedOrder.recipient.addressLine2 || undefined,
              postalOrZipCode: updatedOrder.recipient.postalCode,
              countryCode: updatedOrder.recipient.countryCode,
              townOrCity: updatedOrder.recipient.city,
              stateOrCounty: updatedOrder.recipient.state || undefined,
            },
          },
          items: prodigiItems,
          merchantReference: `ORDER-${updatedOrder.id}`,
          idempotencyKey: `order-${updatedOrder.id}-${Date.now()}`,
          metadata: {
            orderId: updatedOrder.id.toString(),
            squarePaymentId: payment.id,
          },
        };

        console.log('[Prodigi Order] Sending request to Prodigi API...');
        const prodigiOrder = await prodigiService.createOrder(prodigiOrderRequest);

        console.log('[Prodigi Order] Response received:', {
          hasOrder: !!prodigiOrder.order,
          orderId: prodigiOrder.order?.id,
          status: prodigiOrder.order?.status,
        });

        // Update order with Prodigi details
        await prisma.order.update({
          where: { id: updatedOrder.id },
          data: {
            prodigiOrderId: prodigiOrder.order?.id,
            metadata: {
              ...(updatedOrder.metadata as object || {}),
              squarePaymentId: payment.id,
              squarePaymentStatus: payment.status,
              squareOrderId: orderId,
              prodigiOrderId: prodigiOrder.order?.id,
              prodigiStatus: prodigiOrder.order?.status,
            },
          },
        });

        console.log('[Prodigi Order] Created successfully', {
          orderId: updatedOrder.id,
          prodigiOrderId: prodigiOrder.order?.id,
        });
      } catch (prodigiError: any) {
        console.error('[Prodigi Order] Failed to create:', {
          error: prodigiError,
          message: prodigiError.message,
          stack: prodigiError.stack,
          orderId: updatedOrder.id,
        });

        // Log the error but don't fail the webhook
        try {
          await prisma.orderProcessingError.create({
            data: {
              orderId: updatedOrder.id,
              error: prodigiError.message || 'Failed to create Prodigi order',
              retryCount: 0,
              lastAttempt: new Date(),
            },
          });

          // Update order metadata with error info
          await prisma.order.update({
            where: { id: updatedOrder.id },
            data: {
              metadata: {
                ...(updatedOrder.metadata as object || {}),
                prodigiError: prodigiError.message,
                prodigiErrorTime: new Date().toISOString(),
                prodigiErrorDetails: JSON.stringify(prodigiError),
              },
            },
          });

          console.log('[Prodigi Order] Error logged successfully');
        } catch (logError) {
          console.error('[Prodigi Order] Failed to log error:', logError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Square webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
