import { randomUUID } from 'crypto';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod, DiscountType } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyCsrf } from '@repo/auth/csrf';
import { SquareClient, SquareEnvironment, Currency } from 'square';
import { z } from 'zod';
import { prodigiService } from '@/lib/prodigi';

// Square client configuration
const squareEnvironment = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: squareEnvironment,
});

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
});

const CompletePaymentSchema = z.object({
  sourceId: z.string(), // Payment token from Square Web SDK
  items: z.array(CheckoutItemSchema),
  shippingAddress: ShippingAddressSchema,
  discountCode: z.string().optional(), // Optional discount code
});

export async function POST(request: NextRequest) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
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
      const discount = await prisma.discountCode.findUnique({
        where: { code: discountCode.toUpperCase() },
        include: {
          usages: dbUser?.id ? {
            where: { userId: dbUser.id },
          } : false,
        },
      });

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
          create: items.map((item) => ({
            productId: item.productId,
            copies: item.copies,
            price: item.price,
            attributes: {
              color: item.color,
              size: item.size,
              designUrl: item.designUrl, // Store in attributes as fallback
            },
            assets: item.designUrl ? [{ url: item.designUrl }] : undefined,
          })),
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

    const paymentResponse = await squareClient.payments.create({
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
      try {
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
          const sku = productSkuMap.get(item.productId);
          if (!sku) {
            throw new Error(`Product SKU not found for product ID: ${item.productId}`);
          }

          // Get design URL from item or order item assets
          let designUrl = item.designUrl;

          // If no design URL, try to get from order item assets
          if (!designUrl) {
            const orderItemAssets = updatedOrder.orderItems[index]?.assets;
            if (orderItemAssets && typeof orderItemAssets === 'object' && !Array.isArray(orderItemAssets)) {
              designUrl = (orderItemAssets as any).url;
            } else if (Array.isArray(orderItemAssets) && orderItemAssets.length > 0) {
              designUrl = (orderItemAssets[0] as any).url;
            }
          }

          if (!designUrl) {
            console.error('[Prodigi Order] Missing design URL:', {
              itemName: item.name,
              itemIndex: index,
              hasDesignUrlInItem: !!item.designUrl,
              orderItemAssets: updatedOrder.orderItems[index]?.assets,
            });
            throw new Error(`Design URL missing for item: ${item.name}. Please ensure all products have custom designs uploaded.`);
          }

          console.log('[Prodigi Order] Item prepared:', {
            index,
            sku,
            copies: item.copies,
            hasDesignUrl: !!designUrl,
          });

          return {
            sku: sku,
            copies: item.copies,
            merchantReference: `item_${order.id}_${index}`,
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
