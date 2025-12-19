/**
 * Apply Promo Code Tool
 * 
 * Validates and applies promotional discount codes,
 * especially ChatGPT-exclusive offers.
 */

import { z } from 'zod';

const PROMPTLY_PRINTED_API = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

// Input schema
export const applyPromoInputSchema = {
  promoCode: z.string().min(1).describe('Promotional discount code'),
  productSku: z.string().optional().describe('Product SKU to check eligibility'),
};

export const applyPromoTool = {
  name: 'apply_promo_code',
  description: `Validate and apply a promotional discount code.

ChatGPT-exclusive promo codes:
• CHATGPT10 - 10% off first order
• FIRSTDESIGN - 15% off for new customers
• BUNDLE20 - 20% off when ordering 2+ items

Returns discount details if valid, or suggests alternatives if invalid.`,
  inputSchema: applyPromoInputSchema,
};

export interface PromoCodeResult {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description: string;
  minimumOrder?: number;
  expiresAt?: string;
}

export interface ApplyPromoResult {
  success: boolean;
  promo?: PromoCodeResult;
  alternatives?: string[];
  error?: string;
}

// ChatGPT-exclusive promo codes
const CHATGPT_PROMO_CODES: Record<string, PromoCodeResult> = {
  'CHATGPT10': {
    valid: true,
    code: 'CHATGPT10',
    discountType: 'percentage',
    discountValue: 10,
    description: '10% off your first ChatGPT order',
    expiresAt: '2026-12-31',
  },
  'FIRSTDESIGN': {
    valid: true,
    code: 'FIRSTDESIGN',
    discountType: 'percentage',
    discountValue: 15,
    description: '15% off for new customers',
    expiresAt: '2026-12-31',
  },
  'BUNDLE20': {
    valid: true,
    code: 'BUNDLE20',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% off when ordering 2+ items',
    minimumOrder: 2,
    expiresAt: '2026-12-31',
  },
  'WELCOME': {
    valid: true,
    code: 'WELCOME',
    discountType: 'percentage',
    discountValue: 10,
    description: '10% off for new customers',
    expiresAt: '2026-12-31',
  },
};

export interface ApplyPromoInput {
  promoCode: string;
  productSku?: string;
}

export async function handleApplyPromo(
  input: ApplyPromoInput
): Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent: ApplyPromoResult;
  _meta: { component: string };
}> {
  try {
    const normalizedCode = input.promoCode.toUpperCase().trim();
    const promo = CHATGPT_PROMO_CODES[normalizedCode];

    if (promo) {
      return {
        content: [{ 
          type: 'text', 
          text: `🎉 Great news! Code "${promo.code}" is valid!\n\n✅ ${promo.description}\n💰 You'll save ${promo.discountValue}% on your order!\n\nReady to proceed to checkout?` 
        }],
        structuredContent: {
          success: true,
          promo,
        },
        _meta: { component: 'component://widget' },
      };
    }

    // Try to validate against PromptlyPrinted API for other codes
    try {
      const response = await fetch(`${PROMPTLY_PRINTED_API}/api/chatgpt/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode }),
      });

      if (response.ok) {
        const apiPromo = await response.json();
        if (apiPromo.valid) {
          return {
            content: [{ 
              type: 'text', 
              text: `🎉 Code "${apiPromo.code}" applied!\n\n✅ ${apiPromo.description}\n💰 Discount: ${apiPromo.discountValue}${apiPromo.discountType === 'percentage' ? '%' : ' off'}` 
            }],
            structuredContent: {
              success: true,
              promo: apiPromo,
            },
            _meta: { component: 'component://widget' },
          };
        }
      }
    } catch {
      // API not available, fall through to suggestion
    }

    // Invalid code - suggest alternatives
    return {
      content: [{ 
        type: 'text', 
        text: `I couldn't find that promo code. Here are some active ChatGPT-exclusive codes you can try:\n\n• CHATGPT10 - 10% off first order\n• FIRSTDESIGN - 15% off for new customers\n• BUNDLE20 - 20% off 2+ items` 
      }],
      structuredContent: {
        success: false,
        alternatives: ['CHATGPT10', 'FIRSTDESIGN', 'BUNDLE20'],
        error: 'Invalid promo code',
      },
      _meta: { component: 'component://widget' },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ 
        type: 'text', 
        text: 'I had trouble validating that code. Please try one of our ChatGPT-exclusive codes: CHATGPT10, FIRSTDESIGN, or BUNDLE20.' 
      }],
      structuredContent: {
        success: false,
        alternatives: ['CHATGPT10', 'FIRSTDESIGN', 'BUNDLE20'],
        error: errorMessage,
      },
      _meta: { component: 'component://widget' },
    };
  }
}
