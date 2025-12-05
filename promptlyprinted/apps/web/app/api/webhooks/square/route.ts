import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { square } from '@repo/payments';
import crypto from 'crypto';
import { prodigiService } from '@/lib/prodigi';
import { grantTshirtPurchaseBonus } from '@/lib/credits';
import { sendOrderConfirmation } from '@/lib/email';

// In-memory cache for recent webhook event IDs (prevents duplicates within 1 hour)
const processedEventIds = new Map<string, Date>();
const EVENT_CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Clean up old event IDs periodically
setInterval(() => {
  const now = new Date();
  for (const [eventId, timestamp] of processedEventIds.entries()) {
    if (now.getTime() - timestamp.getTime() > EVENT_CACHE_DURATION_MS) {
      processedEventIds.delete(eventId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

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

    // Check if we've already processed this event (deduplication)
    if (processedEventIds.has(eventId)) {
      console.log('[Webhook] Event already processed:', {
        eventId,
        processedAt: processedEventIds.get(eventId),
      });
      return NextResponse.json({ 
        received: true, 
        message: 'Event already processed (duplicate)' 
      });
    }

    // Mark event as being processed
    processedEventIds.set(eventId, new Date());
    console.log('[Webhook] Event marked as processing:', { eventId });

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

      // Get database order ID from payment reference_id (set in complete-payment route)
      // This is the primary way to identify orders created via direct payment
      const dbOrderIdFromRef = payment.reference_id;
      const squareOrderId = payment.order_id;

      console.log('[Webhook] Payment details:', {
        paymentId: payment.id,
        status: payment.status,
        referenceId: dbOrderIdFromRef,
        orderId: squareOrderId,
      });

      // If we have a reference_id, this is a direct payment from complete-payment route
      // We can directly look up the database order
      if (dbOrderIdFromRef && !squareOrderId) {
        console.log('[Webhook] Direct payment detected, using reference_id:', dbOrderIdFromRef);
        
        const dbOrderId = Number.parseInt(dbOrderIdFromRef);
        if (isNaN(dbOrderId)) {
          console.error('[Webhook] Invalid order ID in reference_id:', dbOrderIdFromRef);
          return NextResponse.json({ error: 'Invalid order reference' }, { status: 400 });
        }

        // Fetch the existing order from database
        const existingOrder = await prisma.order.findUnique({
          where: { id: dbOrderId },
          include: {
            recipient: true,
            discountCode: true,
            orderItems: true,
          },
        });

        if (!existingOrder) {
          console.error('[Webhook] Order not found in database:', dbOrderId);
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log('[Webhook] Found existing order:', {
          orderId: existingOrder.id,
          status: existingOrder.status,
          hasProdigiOrderId: !!existingOrder.prodigiOrderId,
        });

        // Update order status to COMPLETED
        const updatedOrder = await prisma.order.update({
          where: { id: dbOrderId },
          data: {
            status: OrderStatus.COMPLETED,
            metadata: {
              ...(existingOrder.metadata as object || {}),
              squarePaymentId: payment.id,
              squarePaymentStatus: payment.status,
            },
          },
          include: {
            recipient: true,
            discountCode: true,
            orderItems: true,
          },
        });

        console.log('[Webhook] Order status updated to COMPLETED:', dbOrderId);

        // Send order confirmation email
        if (updatedOrder.recipient?.email) {
          try {
            console.log('[Email] Sending order confirmation to:', updatedOrder.recipient.email);
            await sendOrderConfirmation({
              to: updatedOrder.recipient.email,
              orderNumber: updatedOrder.id.toString(),
              items: updatedOrder.orderItems.map((item: any) => {
                const attrs = item.attributes as any;
                return {
                  name: attrs?.productName || 'Custom T-Shirt',
                  sku: attrs?.sku || item.merchantReference,
                  size: attrs?.size || 'N/A',
                  color: attrs?.color || 'N/A',
                  copies: item.copies || 1,
                  price: item.price,
                };
              }),
              total: updatedOrder.totalPrice,
              discountAmount: updatedOrder.discountAmount || 0,
              shippingAddress: {
                name: updatedOrder.recipient.name,
                line1: updatedOrder.recipient.addressLine1,
                line2: updatedOrder.recipient.addressLine2 || undefined,
                city: updatedOrder.recipient.city,
                state: updatedOrder.recipient.state || undefined,
                postalCode: updatedOrder.recipient.postalCode,
                country: updatedOrder.recipient.countryCode,
              },
            });
            console.log('[Email] Order confirmation sent successfully');
          } catch (emailError) {
            console.error('[Email] Failed to send order confirmation:', emailError);
          }
        }

        // Grant T-shirt purchase bonus credits
        if (updatedOrder.userId && updatedOrder.userId !== 'guest') {
          try {
            const tshirtCount = updatedOrder.orderItems.length;
            const creditBonus = await grantTshirtPurchaseBonus(
              updatedOrder.userId,
              updatedOrder.id,
              tshirtCount
            );
            console.log('[Credits] T-shirt purchase bonus granted:', {
              userId: updatedOrder.userId,
              orderId: updatedOrder.id,
              creditsGranted: creditBonus.creditsGranted,
            });
          } catch (creditError) {
            console.error('[Credits] Failed to grant T-shirt bonus:', creditError);
          }
        }

        // Record discount usage if applicable
        if (updatedOrder.discountCodeId && updatedOrder.discountAmount && updatedOrder.discountAmount > 0) {
          try {
            const existingUsage = await prisma.discountUsage.findFirst({
              where: {
                discountCodeId: updatedOrder.discountCodeId,
                orderId: updatedOrder.id,
              },
            });

            if (!existingUsage) {
              await prisma.$transaction([
                prisma.discountUsage.create({
                  data: {
                    discountCodeId: updatedOrder.discountCodeId,
                    orderId: updatedOrder.id,
                    userId: updatedOrder.userId !== 'guest' ? updatedOrder.userId : undefined,
                    discountAmount: updatedOrder.discountAmount,
                  },
                }),
                prisma.discountCode.update({
                  where: { id: updatedOrder.discountCodeId },
                  data: { usedCount: { increment: 1 } },
                }),
              ]);
              console.log('[Discount] Usage recorded via webhook');
            }
          } catch (discountError) {
            console.error('[Discount] Failed to record usage:', discountError);
          }
        }

        // Create Prodigi order if not already exists
        if (!updatedOrder.prodigiOrderId) {
          const processingKey = `processing-webhook-direct-${payment.id}-${Date.now()}`;
          
          try {
            // Atomic claim check
            const claimed = await prisma.$transaction(async (tx) => {
              const order = await tx.order.findUnique({
                where: { id: updatedOrder.id },
                select: { prodigiOrderId: true, metadata: true },
              });

              if (order?.prodigiOrderId) return false;

              const metadata = order?.metadata as any;
              if (metadata?.prodigiProcessingKey) {
                const processingStartTime = new Date(metadata.prodigiProcessingStarted || 0);
                const timeDiff = Date.now() - processingStartTime.getTime();
                if (timeDiff < 5 * 60 * 1000) {
                  console.log('[Prodigi Order] Already being processed:', metadata.prodigiProcessingKey);
                  return false;
                }
              }

              await tx.order.update({
                where: { id: updatedOrder.id },
                data: {
                  metadata: {
                    ...(order?.metadata as object || {}),
                    prodigiProcessingKey: processingKey,
                    prodigiProcessingStarted: new Date().toISOString(),
                    source: 'webhook-direct',
                  },
                },
              });
              return true;
            });

            if (!claimed) {
              console.log('[Prodigi Order] Could not claim order, already processing');
              return NextResponse.json({ received: true });
            }

            console.log('[Prodigi Order] Starting creation from webhook (direct payment)...');

            // Prepare Prodigi order items
            const prodigiItems = updatedOrder.orderItems.map((orderItem: any, index: number) => {
              const attrs = orderItem.attributes as any;
              const dbSku = attrs?.sku;

              if (!dbSku) {
                throw new Error(`Product SKU not found for order item ID: ${orderItem.id}`);
              }

              const sku = dbSku.replace(/^[A-Z]{2}-/, '');
              
              let designUrl: string | undefined;
              const assets = orderItem.assets;

              if (assets && typeof assets === 'object' && !Array.isArray(assets)) {
                designUrl = (assets as any).url;
              } else if (Array.isArray(assets) && assets.length > 0) {
                designUrl = (assets[0] as any).url;
              }

              if (!designUrl && orderItem.attributes) {
                designUrl = attrs.printReadyUrl || attrs.designUrl;
              }

              if (!designUrl) {
                throw new Error(`Design URL missing for order item.`);
              }

              // Ensure absolute URL
              if (designUrl.startsWith('/')) {
                const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://promptlyprinted.com';
                designUrl = `${baseUrl}${designUrl}`;
              }

              // Use printReadyUrl if available
              const printReadyUrl = attrs?.printReadyUrl;
              if (printReadyUrl && printReadyUrl.toLowerCase().endsWith('.png')) {
                designUrl = printReadyUrl;
              }

              let color = attrs?.color?.replace(/-/g, ' ').toLowerCase();
              let size = attrs?.size?.toLowerCase();
              if (size === 'xxs') size = '2xs';
              if (size === 'xxxl') size = '3xl';

              return {
                sku,
                copies: orderItem.copies,
                merchantReference: `item_${updatedOrder.id}_${index}`,
                sizing: 'fillPrintArea' as const,
                attributes: {
                  ...(color && { color }),
                  ...(size && { size }),
                },
                assets: [{ printArea: 'front', url: designUrl! }],
              };
            });

            if (!updatedOrder.recipient) {
              throw new Error('No recipient information available');
            }

            const prodigiOrderRequest = {
              shippingMethod: 'Standard' as const,
              recipient: {
                name: updatedOrder.recipient.name,
                email: updatedOrder.recipient.email || 'noemail@example.com',
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
              idempotencyKey: `order-${updatedOrder.id}`,
              metadata: {
                orderId: updatedOrder.id.toString(),
                squarePaymentId: payment.id,
              },
            };

            console.log('[Prodigi Order] Sending request to Prodigi API...');
            const prodigiOrder = await prodigiService.createOrder(prodigiOrderRequest);

            console.log('[Prodigi Order] Created successfully:', {
              orderId: updatedOrder.id,
              prodigiOrderId: prodigiOrder.order?.id,
            });

            await prisma.order.update({
              where: { id: updatedOrder.id },
              data: {
                prodigiOrderId: prodigiOrder.order?.id,
                metadata: {
                  ...(updatedOrder.metadata as object || {}),
                  prodigiOrderId: prodigiOrder.order?.id,
                  prodigiStatus: prodigiOrder.order?.status,
                },
              },
            });
          } catch (prodigiError: any) {
            console.error('[Prodigi Order] Failed to create:', prodigiError);
            
            await prisma.orderProcessingError.create({
              data: {
                orderId: updatedOrder.id,
                error: prodigiError.message || 'Failed to create Prodigi order',
                retryCount: 0,
                lastAttempt: new Date(),
              },
            }).catch(() => {});

            await prisma.order.update({
              where: { id: updatedOrder.id },
              data: {
                metadata: {
                  ...(updatedOrder.metadata as object || {}),
                  prodigiError: prodigiError.message,
                  prodigiErrorTime: new Date().toISOString(),
                },
              },
            }).catch(() => {});
          }
        }

        return NextResponse.json({ received: true, orderId: updatedOrder.id });
      }

      // Fallback: Get order ID from Square order metadata (for payment link orders)
      const orderId = squareOrderId;

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

      // Send order confirmation email
      if (updatedOrder.recipient?.email) {
        try {
          console.log('[Email] Sending order confirmation to:', updatedOrder.recipient.email);

          await sendOrderConfirmation({
            to: updatedOrder.recipient.email,
            orderNumber: updatedOrder.id.toString(),
            items: updatedOrder.orderItems.map((item: any) => {
              const attrs = item.attributes as any;
              return {
                name: attrs?.productName || 'Custom T-Shirt',
                sku: attrs?.sku || item.merchantReference,
                size: attrs?.size || 'N/A',
                color: attrs?.color || 'N/A',
                copies: item.copies || 1,
                price: item.price,
              };
            }),
            total: updatedOrder.totalPrice,
            discountAmount: updatedOrder.discountAmount || 0,
            shippingAddress: {
              name: updatedOrder.recipient.name,
              line1: updatedOrder.recipient.addressLine1,
              line2: updatedOrder.recipient.addressLine2 || undefined,
              city: updatedOrder.recipient.city,
              state: updatedOrder.recipient.state || undefined,
              postalCode: updatedOrder.recipient.postalCode,
              country: updatedOrder.recipient.countryCode,
            },
          });

          console.log('[Email] Order confirmation sent successfully');
        } catch (emailError) {
          console.error('[Email] Failed to send order confirmation:', emailError);
          // Don't fail the webhook if email fails
        }
      } else {
        console.warn('[Email] No recipient email found, skipping order confirmation');
      }

      // COMPETITION: Verify purchase and enter competition
      const orderMetadata = squareOrder.metadata || {};
      const designId = orderMetadata.designId;
      const referralCode = orderMetadata.referralCode;

      if (designId && updatedOrder.userId) {
        try {
          console.log('[Competition] Verifying purchase for competition entry:', {
            orderId: updatedOrder.id,
            designId,
            userId: updatedOrder.userId,
          });

          const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/competition/verify-purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: updatedOrder.id,
              designId: parseInt(designId),
              userId: updatedOrder.userId,
            }),
          });

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('[Competition] Purchase verified and competition entry created:', verifyData);
          } else {
            console.error('[Competition] Failed to verify purchase:', await verifyResponse.text());
          }
        } catch (competitionError) {
          console.error('[Competition] Error verifying purchase:', competitionError);
          // Don't fail the webhook if competition entry fails
        }
      }

      // COMPETITION: Complete referral if exists
      if (referralCode && updatedOrder.userId) {
        try {
          console.log('[Competition] Completing referral:', {
            orderId: updatedOrder.id,
            userId: updatedOrder.userId,
            referralCode,
          });

          const referralResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/competition/complete-referral`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: updatedOrder.id,
              userId: updatedOrder.userId,
              referralCode,
            }),
          });

          if (referralResponse.ok) {
            const referralData = await referralResponse.json();
            console.log('[Competition] Referral completed:', referralData);
          } else {
            console.error('[Competition] Failed to complete referral:', await referralResponse.text());
          }
        } catch (referralError) {
          console.error('[Competition] Error completing referral:', referralError);
          // Don't fail the webhook if referral completion fails
        }
      }

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
      // First, check if Prodigi order already exists to prevent duplicates
      const currentOrderState = await prisma.order.findUnique({
        where: { id: updatedOrder.id },
        select: { prodigiOrderId: true, metadata: true },
      });

      if (currentOrderState?.prodigiOrderId) {
        console.log('[Prodigi Order] Already exists, skipping creation', {
          orderId: updatedOrder.id,
          prodigiOrderId: currentOrderState.prodigiOrderId,
        });
        return NextResponse.json({
          received: true,
          message: 'Prodigi order already exists',
        });
      }

      // Use atomic update to prevent race conditions from multiple webhook calls
      // Try to claim this order for Prodigi processing by setting a processing flag
      const processingKey = `processing-webhook-${eventId}-${Date.now()}`;

      try {
        // Use a transaction to atomically check and update
        const claimed = await prisma.$transaction(async (tx) => {
          // Re-check within transaction to ensure atomicity
          const order = await tx.order.findUnique({
            where: { id: updatedOrder.id },
            select: { prodigiOrderId: true, metadata: true },
          });

          // If Prodigi order already exists, we can't claim it
          if (order?.prodigiOrderId) {
            return false;
          }

          // Check if already being processed by another webhook
          const metadata = order?.metadata as any;
          if (metadata?.prodigiProcessingKey && metadata?.prodigiProcessingStarted) {
            // Check if processing started recently (within last 5 minutes)
            const processingStartTime = new Date(metadata.prodigiProcessingStarted);
            const now = new Date();
            const timeDiff = now.getTime() - processingStartTime.getTime();
            const fiveMinutes = 5 * 60 * 1000; // Increased from 2 to 5 minutes

            if (timeDiff < fiveMinutes) {
              console.log('[Prodigi Order] Already being processed by another webhook', {
                processingKey: metadata.prodigiProcessingKey,
                processingStarted: metadata.prodigiProcessingStarted,
                timeSinceStart: timeDiff,
                lockDurationMinutes: 5,
              });
              return false;
            } else {
              console.log('[Prodigi Order] Processing lock expired, allowing retry', {
                timeSinceStart: timeDiff,
                lockDurationMinutes: 5,
              });
            }
          }

          // Claim the order by setting processing key
          await tx.order.update({
            where: { id: updatedOrder.id },
            data: {
              metadata: {
                ...(order?.metadata as object || {}),
                squarePaymentId: payment.id,
                squarePaymentStatus: payment.status,
                squareOrderId: orderId,
                prodigiProcessingKey: processingKey,
                prodigiProcessingStarted: new Date().toISOString(),
                source: 'webhook',
              },
            },
          });

          return true;
        });

        if (!claimed) {
          console.log('[Prodigi Order] Could not claim order for processing, likely already claimed', {
            orderId: updatedOrder.id,
          });
          return NextResponse.json({
            received: true,
            message: 'Order already being processed or Prodigi order exists',
          });
        }

        console.log('[Prodigi Order] Successfully claimed for processing', {
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

          // Check if there's a pre-generated 300 DPI print-ready URL in attributes
          // Upload creates files with -print.png suffix for 300 DPI versions
          const printReadyUrl = attrs?.printReadyUrl;
          if (printReadyUrl && printReadyUrl.toLowerCase().endsWith('.png')) {
            console.log('[Prodigi Order] Using pre-generated print-ready PNG:', printReadyUrl);
            designUrl = printReadyUrl;
          } else {
            console.log('[Prodigi Order] Using designUrl:', designUrl);
          }

          // Ensure design URL is a proper absolute URL
          if (designUrl.startsWith('/')) {
            const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://promptlyprinted.com';
            designUrl = `${baseUrl}${designUrl}`;
            console.log('[Prodigi Order] Converted to absolute URL:', designUrl);
          } else if (designUrl.startsWith('https://https')) {
            // Fix malformed double-https URLs
            designUrl = designUrl.replace(/^https:\/\/https:?\/?\/?/, 'https://promptlyprinted.com/');
            console.log('[Prodigi Order] Fixed malformed URL:', designUrl);
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
                url: designUrl!,
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
          idempotencyKey: `order-${updatedOrder.id}`, // Deterministic key to prevent duplicates
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
