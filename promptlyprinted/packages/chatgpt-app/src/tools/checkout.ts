/**
 * Checkout Tool
 * 
 * Generates external checkout URL for PromptlyPrinted.
 * Per OpenAI guidelines, checkout happens on the merchant's site.
 */

import { z } from 'zod';

const PROMPTLY_PRINTED_URL = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

// Input schema
export const checkoutInputSchema = {
  productSku: z.string().describe('Product SKU'),
  designUrl: z.string().url().describe('Design URL'),
  color: z.string().describe('Selected color'),
  size: z.string().describe('Selected size'),
  promoCode: z.string().optional().describe('Promo code to apply'),
  quantity: z.number().min(1).max(10).optional().default(1).describe('Quantity'),
};

export const checkoutTool = {
  name: 'checkout',
  description: `Generate checkout link for the configured product.

Creates a pre-filled checkout URL on PromptlyPrinted.com with:
- Selected product, color, and size
- User's design applied
- Promo code pre-applied (if provided)

The user will complete payment on PromptlyPrinted's secure checkout.`,
  inputSchema: checkoutInputSchema,
};

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  productName?: string;
  price?: { amount: number; currency: string };
  discount?: { amount: number; percentage: number };
  finalPrice?: { amount: number; currency: string };
  error?: string;
}

export interface CheckoutInput {
  productSku: string;
  designUrl: string;
  color: string;
  size: string;
  promoCode?: string;
  quantity?: number;
}

// Product prices
const PRODUCT_PRICES: Record<string, { name: string; price: number }> = {
  'TEE-SS-STTU755': { name: "Men's Classic T-Shirt", price: 29.99 },
  'GLOBAL-HO-JH030J': { name: "Classic Hoodie", price: 49.99 },
  'GLOBAL-TT-GIL-64200': { name: "Men's Tank Top", price: 24.99 },
  'GLOBAL-TEE-GIL-2400': { name: "Long Sleeve T-Shirt", price: 34.99 },
  'GLOBAL-TEE-BC-3413': { name: "Triblend T-Shirt", price: 32.99 },
};

// Promo discounts
const PROMO_DISCOUNTS: Record<string, number> = {
  'CHATGPT10': 10,
  'FIRSTDESIGN': 15,
  'BUNDLE20': 20,
  'WELCOME': 10,
};

export async function handleCheckout(
  input: CheckoutInput
): Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent: CheckoutResult;
  _meta: { component: string };
}> {
  try {
    const product = PRODUCT_PRICES[input.productSku];
    
    if (!product) {
      return {
        content: [{ 
          type: 'text', 
          text: 'I couldn\'t find that product. Please select a product first.' 
        }],
        structuredContent: {
          success: false,
          error: 'Product not found',
        },
        _meta: { component: 'component://widget' },
      };
    }

    const quantity = input.quantity || 1;
    let basePrice = product.price * quantity;
    let discountPercentage = 0;
    let discountAmount = 0;

    // Apply promo discount
    if (input.promoCode) {
      const normalizedCode = input.promoCode.toUpperCase().trim();
      discountPercentage = PROMO_DISCOUNTS[normalizedCode] || 0;
      discountAmount = (basePrice * discountPercentage) / 100;
    }

    const finalPrice = basePrice - discountAmount;

    // Build checkout URL with all parameters
    const params = new URLSearchParams({
      sku: input.productSku,
      color: input.color,
      size: input.size,
      qty: quantity.toString(),
      design: input.designUrl,
      source: 'chatgpt',
    });

    if (input.promoCode) {
      params.set('promo', input.promoCode.toUpperCase());
    }

    const checkoutUrl = `${PROMPTLY_PRINTED_URL}/checkout/quick?${params.toString()}`;

    let message = `🛒 Your order is ready!\n\n`;
    message += `📦 ${product.name} (${input.color}, ${input.size})\n`;
    message += `📏 Quantity: ${quantity}\n`;
    
    if (discountPercentage > 0) {
      message += `\n💰 Subtotal: $${basePrice.toFixed(2)}`;
      message += `\n🎉 Discount (${discountPercentage}%): -$${discountAmount.toFixed(2)}`;
      message += `\n✨ **Final Price: $${finalPrice.toFixed(2)}**`;
    } else {
      message += `\n💰 **Price: $${finalPrice.toFixed(2)}**`;
    }

    message += `\n\n[Complete your order on PromptlyPrinted →](${checkoutUrl})`;
    message += `\n\n🔒 Secure checkout • 📦 Ships in 5-10 days`;

    return {
      content: [{ type: 'text', text: message }],
      structuredContent: {
        success: true,
        checkoutUrl,
        productName: product.name,
        price: { amount: basePrice, currency: 'USD' },
        discount: discountPercentage > 0 ? { 
          amount: discountAmount, 
          percentage: discountPercentage 
        } : undefined,
        finalPrice: { amount: finalPrice, currency: 'USD' },
      },
      _meta: { component: 'component://widget' },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ 
        type: 'text', 
        text: 'I had trouble generating the checkout link. Please try again.' 
      }],
      structuredContent: {
        success: false,
        error: errorMessage,
      },
      _meta: { component: 'component://widget' },
    };
  }
}
