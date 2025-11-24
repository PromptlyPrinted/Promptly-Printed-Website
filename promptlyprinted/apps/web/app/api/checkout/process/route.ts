import { randomUUID } from 'crypto';
import { getSession } from '@/lib/session-utils';
import { prisma, OrderStatus, ShippingMethod, DiscountType } from '@repo/database';
import type { User } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { SquareClient, Currency, Country } from 'square';
import { z } from 'zod';

// Square client configuration
const environment = process.env.SQUARE_ENVIRONMENT === 'production'
  ? 'production' as any
  : 'sandbox' as any;

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: environment,
});

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
      if (item.images && item.images.length > 0 && item.images[0].url) {
        lineItem.imageUrl = item.images[0].url;
      }

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
    const squareOrderResponse = await squareClient.orders.create({
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
    const paymentLinkResponse = await squareClient.checkout.paymentLinks.create(paymentLinkRequest);

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
