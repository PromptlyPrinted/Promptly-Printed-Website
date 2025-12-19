/**
 * List Products Tool
 * 
 * Returns available apparel products from PromptlyPrinted catalog.
 */

import { z } from 'zod';

const PROMPTLY_PRINTED_API = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

// Input schema
export const listProductsInputSchema = {
  category: z.enum(['t-shirts', 'hoodies', 'all'])
    .optional()
    .default('all')
    .describe('Product category to filter by'),
  audience: z.enum(['mens', 'womens', 'unisex', 'all'])
    .optional()
    .default('all')
    .describe('Target audience filter'),
  limit: z.number().min(1).max(10).optional().default(6).describe('Maximum products to return'),
};

export const listProductsTool = {
  name: 'list_products',
  description: `List available apparel products from PromptlyPrinted.

Returns product options including t-shirts, hoodies, tank tops, and more.
Each product includes name, price, available colors, and sizes.

Use this to show users what products they can customize with their designs.`,
  inputSchema: listProductsInputSchema,
};

export interface ProductInfo {
  sku: string;
  name: string;
  category: string;
  price: { amount: number; currency: string };
  colors: Array<{ name: string; hex?: string }>;
  sizes: string[];
  imageUrl: string;
  description: string;
}

export interface ListProductsResult {
  success: boolean;
  products: ProductInfo[];
  totalCount: number;
  error?: string;
}

// Popular products to show (curated for ChatGPT experience)
// Limited to T-shirts and Hoodies per business requirements
// Prices sourced from apps/web/data/products.ts
const POPULAR_PRODUCTS: ProductInfo[] = [
  {
    sku: 'TEE-SS-STTU755',
    name: "Men's Classic T-Shirt",
    category: 't-shirts',
    price: { amount: 72, currency: 'USD' },
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#000000' },
      { name: 'French Navy', hex: '#1B1B3A' },
      { name: 'Dark Heather Grey', hex: '#9E9E9E' },
    ],
    sizes: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    imageUrl: 'https://promptlyprinted.com/assets/images/Apparel/Mens/T-Shirts/TEE-SS-STTU755/Blanks/png/white.png',
    description: 'Premium 100% organic cotton unisex t-shirt with modern fit',
  },
  {
    sku: 'GLOBAL-TEE-BC-3413',
    name: "Triblend T-Shirt",
    category: 't-shirts',
    price: { amount: 70, currency: 'USD' },
    colors: [
      { name: 'Military Green', hex: '#4B5320' },
      { name: 'Vintage Royal', hex: '#4169E1' },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    imageUrl: 'https://promptlyprinted.com/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-BC-3413/Blanks/png/military-green-triblend.png',
    description: 'Ultra-soft triblend for premium comfort',
  },
  {
    sku: 'SWEAT-AWD-JH030B',
    name: "Classic Hoodie",
    category: 'hoodies',
    price: { amount: 68, currency: 'USD' },
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Heather Grey', hex: '#9E9E9E' },
      { name: 'Navy', hex: '#1B1B3A' },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    imageUrl: 'https://promptlyprinted.com/assets/images/Apparel/Hoodies/JH030J/Blanks/png/black.png',
    description: 'Cozy pullover hoodie with kangaroo pocket',
  },
];

export interface ListProductsInput {
  category?: string;
  audience?: string;
  limit?: number;
}

export async function handleListProducts(
  input: ListProductsInput
): Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent: ListProductsResult;
  _meta: { component: string };
}> {
  try {
    let products = [...POPULAR_PRODUCTS];
    
    // Filter by category
    if (input.category && input.category !== 'all') {
      products = products.filter(p => p.category === input.category);
    }
    
    // Limit results
    const limit = input.limit || 6;
    products = products.slice(0, limit);

    const productList = products.map(p => `• ${p.name} - $${p.price.amount}`).join('\n');

    return {
      content: [{ 
        type: 'text', 
        text: `Here are our popular products:\n\n${productList}\n\nReady to customize any of these with your design? Just let me know which one you'd like!` 
      }],
      structuredContent: {
        success: true,
        products,
        totalCount: products.length,
      },
      _meta: { component: 'component://widget' },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ 
        type: 'text', 
        text: 'I had trouble loading the product catalog. Let me try again.' 
      }],
      structuredContent: {
        success: false,
        products: [],
        totalCount: 0,
        error: errorMessage,
      },
      _meta: { component: 'component://widget' },
    };
  }
}
