import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 10; // Process 10 products at a time
const DELAY_BETWEEN_PRODUCTS = 1000; // 1 second between products
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 30000; // 30 seconds

// A simpler interface for re-fetching pricing
interface ProdigiPricing {
  outcome: string;
  quotes: Array<{
    shipmentMethod: string;
    costSummary: {
      shipping: { amount: string; currency: string };
      totalTax?: { amount: string; currency: string };
      totalCost?: { amount: string; currency: string };
      items: { amount: string; currency: string };
    };
    items: Array<{
      sku: string;
      copies: number;
      unitCost: { amount: string; currency: string };
      taxUnitCost?: { amount: string; currency: string };
    }>;
    shipments: Array<{
      fulfillmentLocation: {
        countryCode: string;
        labCode: string;
      };
    }>;
  }>;
}

// ADDED: Minimal guess function if you want to re-check productType
function guessProductType(sku: string): string {
  const skuUpper = sku.toUpperCase();
  if (skuUpper.includes('AP-WS')) return 'WATCH_STRAP';
  if (skuUpper.includes('CUSH')) return 'CUSHION';
  if (skuUpper.includes('TATT')) return 'TATTOO';
  if (skuUpper.includes('STI')) return 'STICKER';
  if (skuUpper.includes('BOARD')) return 'GALLERY_BOARD';
  if (skuUpper.includes('PRISM')) return 'ACRYLIC_PRISM';
  if (skuUpper.includes('GITD')) return 'GLOW_IN_THE_DARK_PRINT';
  if (skuUpper.includes('PAP')) return 'PHOTO_PAPER';
  if (skuUpper.includes('HGE')) return 'HAHNEMUHLE_ETCHING';
  if (skuUpper.includes('NB-')) return 'NOTEBOOK';
  // fallback
  return 'APPAREL';
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Re-usable function to get official pricing from Prodigi quotes
 * for a single SKU and country code.
 */
async function getProdigiPricingWithRetry(
  fullSku: string,
  countryCode: string,
  retryCount = 0
): Promise<{
  currency: string;
  basePrice: number;
  shippingCost: number;
  taxAmount: number;
  totalCost: number;
  customerPrice: number;
  fulfillmentCountryCode: string;
  fulfillmentLabCode: string;
  availableShippingMethods: string[];
} | null> {
  try {
    let baseSku = fullSku;
    const indexDash = fullSku.lastIndexOf('-');
    if (indexDash !== -1) {
      baseSku = fullSku.slice(0, indexDash);
    }

    await new Promise((res) => setTimeout(res, 500));

    // Get quotes for all shipping methods
    const shippingMethods = ['Budget', 'Standard', 'Express', 'Overnight'];
    const quotes = await Promise.all(
      shippingMethods.map(async (method) => {
        const response = await fetch(`https://api.prodigi.com/v4.0/quotes`, {
          method: 'POST',
          headers: {
            'X-API-Key': process.env.PRODIGI_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shippingMethod: method,
            destinationCountryCode: countryCode,
            items: [
              {
                sku: baseSku,
                copies: 1,
                assets: [{ printArea: 'default' }],
              },
            ],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          return null;
        }

        const data = (await response.json()) as ProdigiPricing;
        return data.outcome === 'Created'
          ? { method, quote: data.quotes[0] }
          : null;
      })
    );

    // Filter out failed quotes
    const validQuotes = quotes.filter((q) => q !== null);
    if (!validQuotes.length) {
      console.error(`No valid quotes for SKU [${fullSku}]`);
      return null;
    }

    // Get the budget quote for base pricing
    const budgetQuote = validQuotes.find((q) => q?.method === 'Budget')?.quote;
    if (!budgetQuote) {
      console.error(`No budget quote available for SKU [${fullSku}]`);
      return null;
    }

    const item = budgetQuote.items[0];
    const basePrice = Number.parseFloat(item.unitCost.amount || '0');
    const shippingCost = Number.parseFloat(
      budgetQuote.costSummary.shipping.amount || '0'
    );
    const taxAmount = budgetQuote.costSummary.totalTax
      ? Number.parseFloat(budgetQuote.costSummary.totalTax.amount || '0')
      : 0;
    const totalCost = budgetQuote.costSummary.totalCost
      ? Number.parseFloat(budgetQuote.costSummary.totalCost.amount || '0')
      : basePrice + shippingCost + taxAmount;

    // For budget shipping: customer price is 3x total cost with free shipping
    const customerPrice = totalCost * 3;

    return {
      currency: item.unitCost.currency,
      basePrice,
      shippingCost,
      taxAmount,
      totalCost,
      customerPrice,
      fulfillmentCountryCode:
        budgetQuote.shipments[0]?.fulfillmentLocation.countryCode || '',
      fulfillmentLabCode:
        budgetQuote.shipments[0]?.fulfillmentLocation.labCode || '',
      availableShippingMethods: validQuotes.map((q) => q!.method),
    };
  } catch (error: any) {
    if (error.message === 'Rate limit exceeded' && retryCount < MAX_RETRIES) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(
        `Rate limit hit for SKU [${fullSku}], retry ${retryCount + 1} in ${retryDelay / 1000}s...`
      );
      await delay(retryDelay);
      return getProdigiPricingWithRetry(fullSku, countryCode, retryCount + 1);
    }
    console.error(`Error in getProdigiPricing for SKU [${fullSku}]:`, error);
    return null;
  }
}

async function processBatch(
  products: Array<{
    id: number;
    sku: string;
    countryCode: string;
    productType: string;
  }>
) {
  for (const p of products) {
    try {
      console.log(`Processing [${p.sku}] for country [${p.countryCode}]...`);

      const pricing = await getProdigiPricingWithRetry(
        p.sku,
        p.countryCode || 'US'
      );
      if (!pricing) {
        console.warn(`No updated pricing for [${p.sku}]`);
        continue;
      }

      // OPTIONAL: re-check product type
      let newProductType = p.productType;
      if (!newProductType) {
        newProductType = guessProductType(p.sku);
      }

      // Update DB
      await prisma.product.update({
        where: { id: p.id },
        data: {
          currency: pricing.currency,
          price: pricing.basePrice,
          shippingCost: pricing.shippingCost,
          taxAmount: pricing.taxAmount,
          totalCost: pricing.totalCost,
          customerPrice: pricing.customerPrice,
          fulfillmentCountryCode: pricing.fulfillmentCountryCode,
          fulfillmentLabCode: pricing.fulfillmentLabCode,
          productType: newProductType,
          updatedAt: new Date(),
        },
      });
      console.log(
        `  => Successfully updated [${p.sku}] with productType [${newProductType}]`
      );

      // Add delay between products
      await delay(DELAY_BETWEEN_PRODUCTS);
    } catch (error) {
      console.error(`  => Error updating [${p.sku}]:`, error);
    }
  }
}

/**
 * 1) Find all "listed" products in DB
 * 2) For each, parse out the original SKU + country
 * 3) Call /quotes to get updated official pricing
 * 4) Update DB with new shipping/tax/price
 * 5) (Optional) re-guess productType if you want to fix mistakes.
 */
async function updateProductPrices() {
  try {
    console.log('Starting price update process...');

    const products = await prisma.product.findMany({
      where: { listed: true },
      select: {
        id: true,
        sku: true,
        countryCode: true,
        productType: true,
      },
      orderBy: { updatedAt: 'asc' }, // Process oldest updates first
    });

    console.log(`Found [${products.length}] products to refresh...`);

    // Process in batches
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(products.length / BATCH_SIZE)}...`
      );
      await processBatch(batch);
    }

    console.log('Price update process completed.');
  } catch (error) {
    console.error('Error in updateProductPrices:', error);
  } finally {
    await prisma.$disconnect();
    console.log('DB connection closed.');
  }
}

// If you run this script directly:  node cronUpdateProducts.js
if (import.meta.url === `file://${process.argv[1]}`) {
  updateProductPrices();
}

export { updateProductPrices };
