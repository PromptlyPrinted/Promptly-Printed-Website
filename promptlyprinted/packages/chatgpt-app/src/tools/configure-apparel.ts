/**
 * Configure Apparel Tool
 * 
 * Applies a design to a specific product with color and size selection.
 */

import { z } from 'zod';

const PROMPTLY_PRINTED_API = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

// Input schema
export const configureApparelInputSchema = {
  productSku: z.string().describe('SKU of the selected product'),
  designUrl: z.string().url().describe('URL of the design to apply'),
  color: z.string().describe('Selected color name'),
  size: z.string().describe('Selected size'),
};

export const configureApparelTool = {
  name: 'configure_apparel',
  description: `Configure a product with a design, color, and size.

Use this after the user has selected a design and product to finalize their choices.
Returns a mockup preview and price information.

Required:
- productSku: The product SKU from list_products
- designUrl: The design URL from generate_design
- color: User's color choice
- size: User's size choice`,
  inputSchema: configureApparelInputSchema,
};

export interface ConfiguredProduct {
  productSku: string;
  productName: string;
  designUrl: string;
  color: string;
  size: string;
  mockupUrl: string;
  price: { amount: number; currency: string };
  estimatedDelivery: string;
}

export interface ConfigureApparelResult {
  success: boolean;
  configuredProduct?: ConfiguredProduct;
  error?: string;
}

export interface ConfigureApparelInput {
  productSku: string;
  designUrl: string;
  color: string;
  size: string;
}

// Product name lookup
const PRODUCT_NAMES: Record<string, { name: string; price: number }> = {
  'TEE-SS-STTU755': { name: "Men's Classic T-Shirt", price: 29.99 },
  'GLOBAL-HO-JH030J': { name: "Classic Hoodie", price: 49.99 },
  'GLOBAL-TT-GIL-64200': { name: "Men's Tank Top", price: 24.99 },
  'GLOBAL-TEE-GIL-2400': { name: "Long Sleeve T-Shirt", price: 34.99 },
  'GLOBAL-TEE-BC-3413': { name: "Triblend T-Shirt", price: 32.99 },
};

export async function handleConfigureApparel(
  input: ConfigureApparelInput
): Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent: ConfigureApparelResult;
  _meta: { component: string };
}> {
  try {
    const productInfo = PRODUCT_NAMES[input.productSku];
    
    if (!productInfo) {
      return {
        content: [{ 
          type: 'text', 
          text: `I couldn't find that product. Please select from the available options.` 
        }],
        structuredContent: {
          success: false,
          error: 'Product not found',
        },
        _meta: { component: 'component://widget' },
      };
    }

    // Generate mockup URL (in real implementation, call mockup API)
    const mockupUrl = `${PROMPTLY_PRINTED_API}/api/generate-mockup?sku=${input.productSku}&color=${encodeURIComponent(input.color)}&design=${encodeURIComponent(input.designUrl)}`;

    const configuredProduct: ConfiguredProduct = {
      productSku: input.productSku,
      productName: productInfo.name,
      designUrl: input.designUrl,
      color: input.color,
      size: input.size,
      mockupUrl,
      price: { amount: productInfo.price, currency: 'USD' },
      estimatedDelivery: '5-10 business days',
    };

    return {
      content: [{ 
        type: 'text', 
        text: `Perfect! Here's your customized ${productInfo.name} in ${input.color}, size ${input.size}.\n\n💰 Price: $${productInfo.price}\n📦 Estimated delivery: 5-10 business days\n\nReady to checkout? I can also apply a promo code if you have one!` 
      }],
      structuredContent: {
        success: true,
        configuredProduct,
      },
      _meta: { component: 'component://widget' },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ 
        type: 'text', 
        text: 'I had trouble configuring that product. Let me try again.' 
      }],
      structuredContent: {
        success: false,
        error: errorMessage,
      },
      _meta: { component: 'component://widget' },
    };
  }
}
