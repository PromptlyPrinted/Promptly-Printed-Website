import { randomUUID } from 'crypto';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod, DiscountType } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyCsrf } from '@repo/auth/csrf';
import { square } from '@repo/payments';
import { Currency } from 'square';
import { z } from 'zod';
import { prodigiService } from '@/lib/prodigi';

const ShippingAddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const CheckoutItemSchema = z.object({
  productId: z.coerce.number().int(),
  name: z.string(),
  price: z.number(),
  copies: z.number().int().min(1),
  images: z.array(z.object({ url: z.string() })),
  color: z.string(),
  size: z.string(),
  designUrl: z.string().optional(),
  printReadyUrl: z.string().optional(),
});

const CompletePaymentSchema = z.object({
  sourceId: z.string(), // Payment token from Square Web SDK
  items: z.array(CheckoutItemSchema),
  shippingAddress: ShippingAddressSchema,
  discountCode: z.string().optional(), // Optional discount code
});

export async function POST(request: NextRequest) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ message: csrf.error }, { status: csrf.status });
  }
  try {
    const body = await request.json();
    console.log('[Complete Payment] Starting...', { hasSourceId: !!body.sourceId });

    // Validate request
    const validation = CompletePaymentSchema.safeParse(body);
    if (!validation.success) {
      console.error('[Complete Payment] Validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sourceId, items, shippingAddress, discountCode } = validation.data;

    // Get user session if exists
    const session = await getSession(request);
    const dbUser: User | null = session?.user
      ? await prisma.user.findUnique({ where: { id: session.user.id } })
      : null;

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.copies, 0);

    // Validate and apply discount code if provided
    let discountAmount = 0;
    let validatedDiscountCode = null;

    if (discountCode) {
      // Normalize the code: trim and uppercase (codes are stored in uppercase)
      const normalizedCode = discountCode.trim().toUpperCase();
      
      console.log('[Complete Payment] Looking for discount:', discountCode);
      console.log('[Complete Payment] Normalized code:', normalizedCode);
      
      // Find the discount code - try multiple strategies for maximum compatibility
      let discount = null;
      
      // Strategy 1: Exact match with normalized (uppercase) code (most reliable)
      discount = await prisma.discountCode.findFirst({
        where: { 
          code: normalizedCode
        },
        include: {
          usages: dbUser?.id ? {
            where: { userId: dbUser.id },
          } : false,
        },
      });

      // Strategy 2: Case-insensitive search (if exact match failed)
      if (!discount) {
        discount = await prisma.discountCode.findFirst({
          where: { 
            code: {
              equals: normalizedCode,
              mode: 'insensitive'
            }
          },
          include: {
            usages: dbUser?.id ? {
              where: { userId: dbUser.id },
            } : false,
          },
        });
      }

      // Strategy 3: Try with original trimmed code (in case it's stored differently)
      if (!discount && discountCode.trim() !== normalizedCode) {
        discount = await prisma.discountCode.findFirst({
          where: { 
            code: discountCode.trim()
          },
          include: {
            usages: dbUser?.id ? {
              where: { userId: dbUser.id },
            } : false,
          },
        });
      }

      if (discount) {
        const now = new Date();
        let isValid = true;
        let errorMessage = '';

        // Validate discount code
        if (!discount.isActive) {
          isValid = false;
          errorMessage = 'Discount code is no longer active';
        } else if (discount.startsAt && discount.startsAt > now) {
          isValid = false;
          errorMessage = 'Discount code is not yet available';
        } else if (discount.expiresAt && discount.expiresAt < now) {
          isValid = false;
          errorMessage = 'Discount code has expired';
        } else if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
          isValid = false;
          errorMessage = `Minimum order amount of £${discount.minOrderAmount.toFixed(2)} required`;
        } else if (discount.maxUses && discount.usedCount >= discount.maxUses) {
          isValid = false;
          errorMessage = 'Discount code has reached its usage limit';
        } else if (dbUser?.id && discount.maxUsesPerUser) {
          const userUsageCount = Array.isArray(discount.usages) ? discount.usages.length : 0;
          if (userUsageCount >= discount.maxUsesPerUser) {
            isValid = false;
            errorMessage = 'You have already used this discount code';
          }
        }

        if (!isValid) {
          console.error('[Complete Payment] Invalid discount code:', errorMessage);
          return NextResponse.json(
            { error: 'Invalid discount code', message: errorMessage },
            { status: 400 }
          );
        }

        // Calculate discount amount
        if (discount.type === DiscountType.PERCENTAGE) {
          discountAmount = (subtotal * discount.value) / 100;
        } else if (discount.type === DiscountType.FIXED_AMOUNT) {
          discountAmount = Math.min(discount.value, subtotal);
        }

        validatedDiscountCode = discount;
      } else {
        console.error('[Complete Payment] Discount code not found:', discountCode);
        return NextResponse.json(
          { error: 'Invalid discount code', message: 'Discount code not found' },
          { status: 400 }
        );
      }
    }

    // Calculate final total after discount
    const total = subtotal - discountAmount;
    const amountInPence = Math.round(total * 100);

    // Create database order first
    console.log('[Database Order] Creating...');
    const order = await prisma.order.create({
      data: {
        userId: dbUser?.id || 'guest',
        totalPrice: total,
        discountCodeId: validatedDiscountCode?.id,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        shippingMethod: ShippingMethod.STANDARD,
        status: OrderStatus.PENDING,
        recipient: {
          create: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: shippingAddress.email,
            phoneNumber: shippingAddress.phone,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || null,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            countryCode: shippingAddress.country,
          },
        },
        orderItems: {
          create: await Promise.all(
            items.map(async (item) => {
              // Fetch product SKU
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { sku: true },
              });
              
              if (!product?.sku) {
                throw new Error(`SKU not found for product ID: ${item.productId}`);
              }
              
              // Use printReadyUrl (300 DPI) if available, otherwise fall back to designUrl
              const assetUrl = item.printReadyUrl || item.designUrl;
              
              return {
                productId: item.productId,
                copies: item.copies,
                price: item.price,
                attributes: {
                  color: item.color,
                  size: item.size,
                  sku: product.sku, // Store SKU for Prodigi order creation
                  designUrl: item.designUrl, // Store display URL as fallback
                  printReadyUrl: item.printReadyUrl, // Store 300 DPI URL for Prodigi
                },
                // Store the 300 DPI URL in assets for Prodigi order creation
                assets: assetUrl ? [{ url: assetUrl }] : undefined,
              };
            })
          ),
        },
      },
      include: {
        recipient: true,
        orderItems: true,
      },
    });

    console.log('[Database Order] Created', { orderId: order.id });

    // Create payment with Square
    console.log('[Square Payment] Creating...', { amountInPence, discountAmount });

    const idempotencyKey = randomUUID();

    // Build payment note with discount info if applicable
    let paymentNote = `Order #${order.id} - ${items.length} item(s)`;
    if (validatedDiscountCode && discountAmount > 0) {
      paymentNote += ` | Discount: ${validatedDiscountCode.code} (-£${discountAmount.toFixed(2)})`;
    }

    // Build statement description (max 20 characters for card statements)
    const statementDescription = `PP Order #${order.id}`;

    const paymentResponse = await square.payments.create({
      sourceId: sourceId,
      idempotencyKey: idempotencyKey,
      amountMoney: {
        amount: BigInt(amountInPence),
        currency: Currency.Gbp,
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      referenceId: order.id.toString(),
      note: paymentNote,
      buyerEmailAddress: shippingAddress.email,
      statementDescriptionIdentifier: statementDescription,
    });

    if (!paymentResponse.payment) {
      throw new Error('Payment response missing payment object');
    }

    console.log('[Square Payment] Created', {
      paymentId: paymentResponse.payment.id,
      status: paymentResponse.payment.status,
      amount: paymentResponse.payment.amountMoney,
    });

    // Update order with payment info
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: paymentResponse.payment.status === 'COMPLETED' ? OrderStatus.COMPLETED : OrderStatus.PENDING,
        metadata: {
          squarePaymentId: paymentResponse.payment.id,
          squarePaymentStatus: paymentResponse.payment.status,
          subtotal: subtotal,
          ...(validatedDiscountCode && discountAmount > 0 ? {
            discountCode: validatedDiscountCode.code,
            discountType: validatedDiscountCode.type,
            discountValue: validatedDiscountCode.value,
            discountAmount: discountAmount,
          } : {}),
        },
      },
      include: {
        recipient: true,
        orderItems: {
          include: {
            customization: true,
          },
        },
      },
    });

    console.log('[Complete Payment] Success', {
      orderId: order.id,
      paymentStatus: paymentResponse.payment.status,
      willCreateProdigiOrder: paymentResponse.payment.status === 'COMPLETED'
    });

    // Record discount usage if payment is completed and discount was applied
    if (paymentResponse.payment.status === 'COMPLETED' && validatedDiscountCode && discountAmount > 0) {
      try {
        await prisma.$transaction([
          // Create discount usage record
          prisma.discountUsage.create({
            data: {
              discountCodeId: validatedDiscountCode.id,
              orderId: order.id,
              userId: dbUser?.id,
              discountAmount,
            },
          }),
          // Increment the used count
          prisma.discountCode.update({
            where: { id: validatedDiscountCode.id },
            data: { usedCount: { increment: 1 } },
          }),
        ]);
        console.log('[Discount] Usage recorded', {
          discountCode: validatedDiscountCode.code,
          discountAmount,
        });
      } catch (discountError) {
        console.error('[Discount] Failed to record usage:', discountError);
        // Don't fail the order if discount tracking fails
      }
    }

    // Create Prodigi order if payment is completed
    if (paymentResponse.payment.status === 'COMPLETED') {
      // Try to claim this order for Prodigi processing by setting a processing flag
      // This prevents race conditions with the webhook
      const processingKey = `processing-payment-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      try {
        // Atomic check-and-set: only update if prodigiOrderId is null AND not already processing
        const claimResult = await prisma.order.updateMany({
          where: {
            id: order.id,
            prodigiOrderId: null,
            // We can't easily check JSON fields in updateMany with Prisma + SQLite/Postgres consistently
            // so we rely on the fact that we just created the order and it shouldn't be processing yet.
            // However, the webhook might have fired VERY fast.
          },
          data: {
            metadata: {
              ...(updatedOrder.metadata as object || {}),
              squarePaymentId: paymentResponse.payment.id,
              squarePaymentStatus: paymentResponse.payment.status,
              prodigiProcessingKey: processingKey,
              prodigiProcessingStarted: new Date().toISOString(),
              source: 'complete-payment', // Track source of creation
            },
          },
        });

        // Re-fetch order to check if we successfully claimed it (or if it was already claimed/processed)
        const currentOrder = await prisma.order.findUnique({
          where: { id: order.id },
          select: { metadata: true, prodigiOrderId: true }
        });
        
        const metadata = currentOrder?.metadata as any;
        const isClaimedByUs = metadata?.prodigiProcessingKey === processingKey;
        
        if (currentOrder?.prodigiOrderId || !isClaimedByUs) {
          console.log('[Prodigi Order] Already being processed or completed by webhook, skipping', {
            orderId: order.id,
            prodigiOrderId: currentOrder?.prodigiOrderId,
            claimedBy: metadata?.prodigiProcessingKey
          });
          // Return success as the order is being handled
          return NextResponse.json({
            success: true,
            orderId: order.id,
            paymentId: paymentResponse.payment.id,
            status: paymentResponse.payment.status,
            message: 'Order created and payment successful. Fulfillment processing handled by webhook.',
          });
        }

        console.log('[Prodigi Order] Claimed for processing', {
          orderId: order.id,
          processingKey,
        });

        console.log('[Prodigi Order] Starting creation process...', {
          orderId: order.id,
          itemCount: items.length,
          hasProdigiApiKey: !!process.env.PRODIGI_API_KEY,
        });

        // Get product details for SKUs
        const productIds = items.map(item => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, sku: true },
        });

        const productSkuMap = new Map(products.map(p => [p.id, p.sku]));

        console.log('[Prodigi Order] Product SKU mapping:', {
          requestedProductIds: productIds,
          foundProducts: products.length,
          skuMap: Array.from(productSkuMap.entries()),
        });

        // Prepare Prodigi order items
        const prodigiItems = items.map((item, index) => {
          const dbSku = productSkuMap.get(item.productId);
          if (!dbSku) {
            throw new Error(`Product SKU not found for product ID: ${item.productId}`);
          }

          // Strip country prefix (US-, GB-, DE-, etc.) from SKU for Prodigi
          // Database stores SKUs like "US-TEE-SS-STTU755" but Prodigi expects "TEE-SS-STTU755"
          const sku = dbSku.replace(/^[A-Z]{2}-/, '');
          console.log('[Prodigi Order] SKU conversion:', { dbSku, prodigiSku: sku });

          // Get design URL from item or order item assets/attributes
          // Prefer printReadyUrl (300 DPI) if available
          let designUrl = item.printReadyUrl || item.designUrl;

          // If no design URL in item, try to get from order item assets
          if (!designUrl) {
            const orderItemAssets = updatedOrder.orderItems[index]?.assets;
            if (orderItemAssets && typeof orderItemAssets === 'object' && !Array.isArray(orderItemAssets)) {
              designUrl = (orderItemAssets as any).url;
            } else if (Array.isArray(orderItemAssets) && orderItemAssets.length > 0) {
              designUrl = (orderItemAssets[0] as any).url;
            }
          }

          // If still no design URL, check attributes as fallback
          if (!designUrl) {
            const orderItemAttributes = updatedOrder.orderItems[index]?.attributes;
            if (orderItemAttributes && typeof orderItemAttributes === 'object') {
              const attrs = orderItemAttributes as any;
              designUrl = attrs.printReadyUrl || attrs.designUrl;
            }
          }

          if (!designUrl) {
            console.error('[Prodigi Order] Missing design URL:', {
              itemName: item.name,
              itemIndex: index,
              hasDesignUrlInItem: !!item.designUrl,
              orderItemAssets: updatedOrder.orderItems[index]?.assets,
              orderItemAttributes: updatedOrder.orderItems[index]?.attributes,
            });
            throw new Error(`Design URL missing for item: ${item.name}. Please ensure all products have custom designs uploaded.`);
          }

          // Get color and size from item for Prodigi attributes
          const color = item.color;
          const size = item.size;

          console.log('[Prodigi Order] Item prepared:', {
            index,
            sku,
            copies: item.copies,
            color,
            size,
            hasDesignUrl: !!designUrl,
          });

          return {
            sku: sku,
            copies: item.copies,
            merchantReference: `item_${order.id}_${index}`,
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

        // Create Prodigi order
        const prodigiOrderRequest = {
          shippingMethod: 'Standard' as const,
          recipient: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: shippingAddress.email,
            phoneNumber: shippingAddress.phone,
            address: {
              line1: shippingAddress.addressLine1,
              line2: shippingAddress.addressLine2,
              postalOrZipCode: shippingAddress.postalCode,
              countryCode: shippingAddress.country,
              townOrCity: shippingAddress.city,
            },
          },
          items: prodigiItems,
          merchantReference: `ORDER-${order.id}`,
          idempotencyKey: `order-${order.id}-${Date.now()}`,
          metadata: {
            orderId: order.id.toString(),
            squarePaymentId: paymentResponse.payment.id,
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
          where: { id: order.id },
          data: {
            prodigiOrderId: prodigiOrder.order?.id,
            metadata: {
              ...(updatedOrder.metadata as object || {}),
              squarePaymentId: paymentResponse.payment.id,
              squarePaymentStatus: paymentResponse.payment.status,
              prodigiOrderId: prodigiOrder.order?.id,
              prodigiStatus: prodigiOrder.order?.status,
            },
          },
        });

        console.log('[Prodigi Order] Created successfully', {
          orderId: order.id,
          prodigiOrderId: prodigiOrder.order?.id,
        });
      } catch (prodigiError: any) {
        console.error('[Prodigi Order] Failed to create:', {
          error: prodigiError,
          message: prodigiError.message,
          stack: prodigiError.stack,
          orderId: order.id,
        });

        // Log the error but don't fail the payment
        // The order can be manually sent to Prodigi later
        try {
          await prisma.orderProcessingError.create({
            data: {
              orderId: order.id,
              error: prodigiError.message || 'Failed to create Prodigi order',
              retryCount: 0,
              lastAttempt: new Date(),
            },
          });

          // Update order metadata with error info
          await prisma.order.update({
            where: { id: order.id },
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
    } else {
      console.log('[Prodigi Order] Skipped - payment not completed:', {
        orderId: order.id,
        paymentStatus: paymentResponse.payment.status,
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: paymentResponse.payment.id,
      status: paymentResponse.payment.status,
      discountApplied: discountAmount > 0 ? {
        code: validatedDiscountCode?.code,
        amount: discountAmount,
      } : null,
    });

  } catch (error: any) {
    console.error('[Complete Payment] Error:', error);

    // Extract Square error details if available
    const errorMessage = error.errors?.[0]?.detail || error.message || 'Payment processing failed';

    return NextResponse.json(
      {
        error: 'Payment processing failed',
        message: errorMessage,
        details: error.errors || [],
      },
      { status: 500 }
    );
  }
}
