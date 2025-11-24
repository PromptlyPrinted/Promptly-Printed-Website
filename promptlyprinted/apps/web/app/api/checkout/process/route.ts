import { randomUUID } from 'crypto';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod, DiscountType } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { square } from '@repo/payments';
import { Currency, Country } from 'square';
import { z } from 'zod';

const AddressSchema = z.object({
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
  productId: z.coerce.number().int().positive('Product ID must be a positive integer'),
  name: z.string(),
  price: z.number(),
  copies: z.number().int().min(1),
  images: z.array(z.object({ url: z.string() })),
  color: z.string(),
  size: z.string(),
  designUrl: z.string().optional(),
  printReadyUrl: z.string().optional(), // 300 DPI print-ready version for Prodigi
});

const ProcessCheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema.optional(), // Optional separate shipping address
  discountCode: z.string().optional(), // Optional discount code
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Checkout Process] Starting...', {
      itemCount: body.items?.length,
      items: body.items?.map((item: any) => ({
        productId: item.productId,
        productIdType: typeof item.productId,
        name: item.name
      }))
    });

    // Validate request
    const validation = ProcessCheckoutSchema.safeParse(body);
    if (!validation.success) {
      console.error('[Checkout Process] Validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { items, billingAddress, shippingAddress, discountCode } = validation.data;
    
    // Use shipping address if provided, otherwise use billing address for shipping
    const deliveryAddress = shippingAddress || billingAddress;

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
          console.error('[Checkout Process] Invalid discount code:', errorMessage);
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
        console.log('[Checkout Process] Discount applied:', {
          code: discount.code,
          type: discount.type,
          value: discount.value,
          discountAmount,
        });
      } else {
        console.error('[Checkout Process] Discount code not found:', discountCode);
        return NextResponse.json(
          { error: 'Invalid discount code', message: 'Discount code not found' },
          { status: 400 }
        );
      }
    }

    // Calculate final total after discount
    const total = subtotal - discountAmount;

    // Fetch product SKUs for all items
    console.log('[Product SKUs] Fetching...');
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, sku: true },
    });
    
    const productSkuMap = new Map(products.map(p => [p.id, p.sku]));
    console.log('[Product SKUs] Fetched:', { count: products.length });

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
            name: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
            email: deliveryAddress.email,
            phoneNumber: deliveryAddress.phone,
            addressLine1: deliveryAddress.addressLine1,
            addressLine2: deliveryAddress.addressLine2 || null,
            city: deliveryAddress.city,
            postalCode: deliveryAddress.postalCode,
            countryCode: deliveryAddress.country,
          },
        },
        orderItems: {
          create: items.map((item) => {
            const sku = productSkuMap.get(item.productId);
            if (!sku) {
              throw new Error(`SKU not found for product ID: ${item.productId}`);
            }
            
            return {
              productId: item.productId,
              copies: item.copies,
              price: item.price,
              attributes: {
                color: item.color,
                size: item.size,
                sku: sku, // Store SKU for Prodigi order creation
                designUrl: item.designUrl, // Store in attributes as fallback
                printReadyUrl: item.printReadyUrl, // 300 DPI version for Prodigi
              },
              assets: item.designUrl ? [{ url: item.designUrl }] : undefined,
            };
          }),
        },
      },
      include: {
        recipient: true,
        orderItems: true,
      },
    });

    console.log('[Database Order] Created', { orderId: order.id });

    // Create Square order
    const squareMetadata: Record<string, string> = {
      orderId: order.id.toString(),
      isGuestCheckout: (!dbUser).toString(),
    };

    // Add discount info to metadata if applicable
    if (validatedDiscountCode && discountAmount > 0) {
      squareMetadata.discountCode = validatedDiscountCode.code;
      squareMetadata.discountAmount = discountAmount.toFixed(2);
      squareMetadata.discountType = validatedDiscountCode.type;
    }

    const lineItems = items.map((item) => {
      const lineItem: any = {
        name: item.name,
        quantity: item.copies.toString(),
        basePriceMoney: {
          amount: BigInt(Math.round(item.price * 100)),
          currency: Currency.Gbp,
        },
        note: `${item.color} - ${item.size}${item.designUrl ? ' - Custom Design' : ''}`,
      };

      // Add product image if available
      // if (item.images && item.images.length > 0 && item.images[0].url) {
      //   lineItem.imageUrl = item.images[0].url;
      // }
      // TEMPORARY: Hardcoded base64 image for testing
      lineItem.imageUrl = "data:image/jpeg;base64,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";

      return lineItem;
    });

    // Build discounts array for Square (discounts must be separate, not negative line items)
    const discounts: any[] = [];
    if (validatedDiscountCode && discountAmount > 0) {
      if (validatedDiscountCode.type === DiscountType.PERCENTAGE) {
        discounts.push({
          uid: `discount-${validatedDiscountCode.id}`,
          name: `Discount: ${validatedDiscountCode.code}`,
          percentage: validatedDiscountCode.value.toString(),
          scope: 'ORDER',
        });
      } else {
        // Fixed amount discount
        discounts.push({
          uid: `discount-${validatedDiscountCode.id}`,
          name: `Discount: ${validatedDiscountCode.code}`,
          amountMoney: {
            amount: BigInt(Math.round(discountAmount * 100)),
            currency: Currency.Gbp,
          },
          scope: 'ORDER',
        });
      }
    }

    console.log('[Square Order] Creating...', {
      itemCount: lineItems.length,
      hasDiscount: discountAmount > 0,
      discountCount: discounts.length,
    });
    const squareOrderResponse = await square.orders.create({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: lineItems,
        discounts: discounts.length > 0 ? discounts : undefined,
        metadata: squareMetadata,
      },
      idempotencyKey: randomUUID(),
    });

    if (!squareOrderResponse.order) {
      throw new Error('Failed to create Square order');
    }

    const squareOrderId = squareOrderResponse.order.id!;
    console.log('[Square Order] Created', { squareOrderId });

    // Store Square order ID in metadata
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          squareOrderId: squareOrderId,
        },
      },
    });

    // Create payment link
    const paymentLinkRequest = {
      idempotencyKey: randomUUID(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        referenceId: squareOrderId,
        lineItems: lineItems,
        discounts: discounts.length > 0 ? discounts : undefined,
        metadata: squareMetadata,
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success?orderId=${order.id}`,
        askForShippingAddress: false, // We already collected it
        enableCoupon: false, // Disable Square's coupon field - we handle discounts on our checkout page
        acceptedPaymentMethods: {
          applePay: true,
          googlePay: true,
          cashAppPay: true,
          afterpayClearpay: true,
        },
      },
      prePopulatedData: {
        buyerEmail: billingAddress.email,
        buyerPhoneNumber: billingAddress.phone,
        buyerAddress: {
          addressLine1: billingAddress.addressLine1,
          addressLine2: billingAddress.addressLine2,
          locality: billingAddress.city,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country as Country,
        },
      },
    };

    console.log('[Square Payment Link] Creating...');
    const paymentLinkResponse = await square.checkout.paymentLinks.create(paymentLinkRequest);

    if (!paymentLinkResponse.paymentLink?.url) {
      throw new Error('Failed to create payment link');
    }

    console.log('[Square Payment Link] Created', {
      paymentLinkId: paymentLinkResponse.paymentLink.id,
      url: paymentLinkResponse.paymentLink.url,
    });

    // Update order metadata with payment link ID and discount info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...(order.metadata as object || {}),
          squareOrderId: squareOrderId,
          squarePaymentLinkId: paymentLinkResponse.paymentLink.id,
          subtotal: subtotal,
          ...(validatedDiscountCode && discountAmount > 0 ? {
            discountCode: validatedDiscountCode.code,
            discountType: validatedDiscountCode.type,
            discountValue: validatedDiscountCode.value,
            discountAmount: discountAmount,
          } : {}),
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      checkoutUrl: paymentLinkResponse.paymentLink.url,
      discountApplied: discountAmount > 0 ? {
        code: validatedDiscountCode?.code,
        amount: discountAmount,
      } : null,
    });

  } catch (error: any) {
    console.error('[Checkout Process] Error:', error);
    return NextResponse.json(
      {
        error: 'Checkout processing failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
