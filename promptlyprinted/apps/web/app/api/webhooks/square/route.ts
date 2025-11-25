import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { square } from '@repo/payments';
import crypto from 'crypto';
import { prodigiService } from '@/lib/prodigi';
import { grantTshirtPurchaseBonus } from '@/lib/credits';

const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

// Log webhook configuration on startup
console.log('[Webhook Config]', {
  hasSignatureKey: !!webhookSignatureKey,
  signatureKeyLength: webhookSignatureKey?.length || 0,
  signatureKeyPreview: webhookSignatureKey ? `${webhookSignatureKey.substring(0, 8)}...` : 'NOT SET',
});

if (!webhookSignatureKey) {
  console.error('[Webhook] CRITICAL: SQUARE_WEBHOOK_SIGNATURE_KEY is not set!');
}

// Verify Square webhook signature
// Per Square docs: signature = HMAC-SHA256(notification_url + request_body)
function verifySquareWebhook(body: string, signature: string, notificationUrl: string): boolean {
  if (!webhookSignatureKey) {
    console.error('[Webhook] Cannot verify signature - key not configured');
    return false;
  }
  
  // Square requires: HMAC-SHA256(notification_url + request_body)
  const signaturePayload = notificationUrl + body;
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  const hash = hmac.update(signaturePayload).digest('base64');
  const isValid = hash === signature;
  
  console.log('[Webhook] Signature verification:', {
    isValid,
    notificationUrl,
    bodyLength: body.length,
    receivedSignaturePreview: signature.substring(0, 20) + '...',
    computedHashPreview: hash.substring(0, 20) + '...',
    signaturesMatch: hash === signature,
  });
  
  return isValid;
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

    // Get the notification URL from environment or construct it
    const notificationUrl = process.env.SQUARE_WEBHOOK_URL || 
                           `${process.env.NEXT_PUBLIC_WEB_URL}/api/webhooks/square`;

    // Verify webhook signature
    if (!verifySquareWebhook(body, signature, notificationUrl)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Log event info
    const eventId = event.event_id;
    console.log('[Webhook] Processing event:', { type: event.type, eventId });

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
    // Only process payment.updated to avoid duplicates from payment.created
    if (event.type === 'payment.updated') {
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
      console.log('[Webhook] Retrieving Square order:', orderId);
      const squareOrderResponse = await square.orders.get({ orderId });
      const squareOrder = squareOrderResponse.order;

      console.log('[Webhook] Square order metadata:', {
        hasOrder: !!squareOrder,
        hasMetadata: !!squareOrder?.metadata,
        metadata: squareOrder?.metadata,
        orderId: squareOrder?.id,
      });

      if (!squareOrder || !squareOrder.metadata) {
        console.error('[Webhook] No metadata found in Square order - this might be a payment link order');
        console.error('[Webhook] Square order details:', {
          id: squareOrder?.id,
          metadata: squareOrder?.metadata,
          referenceId: squareOrder?.referenceId,
        });
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

        // Grant T-shirt purchase bonus credits for guest order
        if (user && user.id !== 'guest') {
          try {
            const tshirtCount = orderData.items.length;
            const creditBonus = await grantTshirtPurchaseBonus(
              user.id,
              order.id,
              tshirtCount
            );

            console.log('[Credits] Guest T-shirt purchase bonus granted:', {
              userId: user.id,
              orderId: order.id,
              tshirtCount,
              creditsGranted: creditBonus.creditsGranted,
              newBalance: creditBonus.newBalance,
            });
          } catch (creditError) {
            console.error('[Credits] Failed to grant guest T-shirt bonus:', creditError);
          }
        }

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
          orderItems: true, // Just get order items without product relation
        },
      });

      console.log('Updated order:', {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
      });

      // Grant T-shirt purchase bonus credits (10 credits per T-shirt)
      if (updatedOrder.userId && updatedOrder.userId !== 'guest') {
        try {
          const tshirtCount = updatedOrder.orderItems.length; // Each order item is typically 1 T-shirt
          const creditBonus = await grantTshirtPurchaseBonus(
            updatedOrder.userId,
            updatedOrder.id,
            tshirtCount
          );

          console.log('[Credits] T-shirt purchase bonus granted:', {
            userId: updatedOrder.userId,
            orderId: updatedOrder.id,
            tshirtCount,
            creditsGranted: creditBonus.creditsGranted,
            newBalance: creditBonus.newBalance,
          });
        } catch (creditError) {
          console.error('[Credits] Failed to grant T-shirt bonus:', creditError);
          // Don't fail the webhook if credit granting fails
        }
      }

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
      // Use atomic update to prevent race conditions from multiple webhook calls
      // Try to claim this order for Prodigi processing by setting a processing flag
      const processingKey = `processing-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      try {
        // Atomic check-and-set: only update if prodigiOrderId is null AND not already processing
        const claimResult = await prisma.order.updateMany({
          where: {
            id: updatedOrder.id,
            prodigiOrderId: null,
            // Ensure we're not already processing (check metadata doesn't have a recent processingKey)
          },
          data: {
            metadata: {
              ...(updatedOrder.metadata as object || {}),
              squarePaymentId: payment.id,
              squarePaymentStatus: payment.status,
              squareOrderId: orderId,
              prodigiProcessingKey: processingKey,
              prodigiProcessingStarted: new Date().toISOString(),
            },
          },
        });

        if (claimResult.count === 0) {
          // Either already has prodigiOrderId or another process claimed it
          console.log('[Prodigi Order] Already being processed or completed, skipping', {
            orderId: updatedOrder.id,
          });
          return NextResponse.json({
            received: true,
            message: 'Order already being processed or Prodigi order exists',
          });
        }

        console.log('[Prodigi Order] Claimed for processing', {
          orderId: updatedOrder.id,
          processingKey,
        });
      } catch (claimError) {
        console.error('[Prodigi Order] Failed to claim order:', claimError);
        return NextResponse.json({
          received: true,
          message: 'Failed to claim order for processing',
        });
      }

      try {
        console.log('[Prodigi Order] Starting creation from webhook...', {
          orderId: updatedOrder.id,
          itemCount: updatedOrder.orderItems.length,
        });

        // Prepare Prodigi order items
        const prodigiItems = updatedOrder.orderItems.map((orderItem: any, index: number) => {
          // Get SKU from attributes (stored during checkout)
          const attrs = orderItem.attributes as any;
          const dbSku = attrs?.sku;

          if (!dbSku) {
            console.error('[Prodigi Order] Missing SKU:', {
              orderItemId: orderItem.id,
              attributes: orderItem.attributes,
            });
            throw new Error(`Product SKU not found for order item ID: ${orderItem.id}`);
          }

          // Strip country prefix (US-, GB-, DE-, etc.) from SKU for Prodigi
          // Database stores SKUs like "US-TEE-SS-STTU755" but Prodigi expects "TEE-SS-STTU755"
          const sku = dbSku.replace(/^[A-Z]{2}-/, '');
          console.log('[Prodigi Order] SKU conversion:', { dbSku, prodigiSku: sku });

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

          // Ensure design URL is a proper absolute URL
          if (designUrl.startsWith('/')) {
            // Relative path - prepend domain
            const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://promptlyprinted.com';
            designUrl = `${baseUrl}${designUrl}`;
          } else if (designUrl.startsWith('https://https')) {
            // Fix malformed double-https URLs
            designUrl = designUrl.replace(/^https:\/\/https:?\/?\/?/, 'https://promptlyprinted.com/');
          }

          // Check if there's a pre-generated 300 DPI print-ready URL in attributes
          const printReadyUrl = attrs?.printReadyUrl;
          if (printReadyUrl) {
            console.log('[Prodigi Order] Using pre-generated 300 DPI URL:', printReadyUrl);
            designUrl = printReadyUrl;
          } else {
            console.log('[Prodigi Order] No 300 DPI URL found, using original design URL:', designUrl);
          }

          // Get color and size from attributes for Prodigi
          let color = attrs?.color;
          let size = attrs?.size;

          // Format color: convert kebab-case to space-separated (e.g., "spectra-yellow" -> "spectra yellow")
          if (color) {
            color = color.replace(/-/g, ' ').toLowerCase();
          }

          // Format size: convert to lowercase and handle special cases
          // Prodigi expects: xs, s, m, l, xl, 2xl, 3xl, 4xl, 5xl, 2xs
          if (size) {
            size = size.toLowerCase();
            // Convert XXS to 2xs, XXXL to 3xl, etc.
            if (size === 'xxs') size = '2xs';
            if (size === 'xxxl') size = '3xl';
            if (size === 'xxxxl') size = '4xl';
            if (size === 'xxxxxl') size = '5xl';
          }

          console.log('[Prodigi Order] Item prepared:', {
            index,
            sku,
            copies: orderItem.copies,
            color,
            size,
            hasDesignUrl: !!designUrl,
          });

          return {
            sku: sku,
            copies: orderItem.copies,
            merchantReference: `item_${updatedOrder.id}_${index}`,
            sizing: 'fillPrintArea' as const,
            attributes: {
              ...(color && { color }),
              ...(size && { size }),
            },
            assets: [
              {
                printArea: 'front', // Changed from 'default' to 'front' for t-shirts
                url: designUrl,
              },
            ],
          };
        });

        console.log('[Prodigi Order] All items prepared successfully:', {
          itemCount: prodigiItems.length,
        });

        // Check if recipient exists
        if (!updatedOrder.recipient) {
          console.error('[Prodigi Order] No recipient found for order:', updatedOrder.id);
          throw new Error('No recipient information available for order');
        }

        // Create Prodigi order
        const prodigiOrderRequest = {
          shippingMethod: 'Standard' as const,
          recipient: {
            name: updatedOrder.recipient.name,
            email: updatedOrder.recipient.email || 'noemail@example.com', // Fallback for null
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
