import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const prisma = new PrismaClient();

// --------------------------------------------------
// Interfaces for Prodigi responses
// --------------------------------------------------
interface ProdigiProduct {
  sku: string;
  description: string;
  productDimensions: {
    width: number;
    height: number;
    units: string;
  };
  // "attributes" can vary by product, so be flexible:
  attributes: {
    brand?: string[];
    edge?: string[];
    color?: string[];
    gender?: string[];
    size?: string[];
    style?: string[];
    productType?: string[];
  };
  variants: Array<{
    attributes: {
      [key: string]: string;
    };
    shipsTo: string[];
    printAreaSizes: {
      default: {
        horizontalResolution: number;
        verticalResolution: number;
      };
    };
  }>;
}

interface ProdigiPricing {
  outcome: string;
  quotes: Array<{
    shipmentMethod: string;
    costSummary: {
      items: {
        amount: string;
        currency: string;
      };
      shipping: {
        amount: string;
        currency: string;
      };
      totalCost?: {
        amount: string;
        currency: string;
      };
      totalTax?: {
        amount: string;
        currency: string;
      };
    };
    shipments: Array<{
      fulfillmentLocation: {
        countryCode: string;
        labCode: string;
      };
      cost?: {
        amount: string;
        currency: string;
      };
      tax?: {
        amount: string;
        currency: string;
      };
    }>;
    items: Array<{
      sku: string;
      copies: number;
      unitCost: {
        amount: string;
        currency: string;
      };
      taxUnitCost?: {
        amount: string;
        currency: string;
      };
    }>;
  }>;
}

interface ProdigiResponse {
  outcome: string; // e.g. "Ok"
  product?: ProdigiProduct;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ADDED: Basic function to guess product type from SKU or description.
 * You can expand this logic if needed.
 */
function guessProductType(sku: string, description: string): string {
  const skuUpper = sku.toUpperCase();

  // If product.attributes.productType is present, we'll use that later.
  // Otherwise, we fallback to these guesses:
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
  if (skuUpper.includes('TEE') || description.toLowerCase().includes('shirt'))
    return 'T-SHIRT';
  if (skuUpper.includes('BAG') || description.toLowerCase().includes('tote'))
    return 'BAG';
  // Fallback
  return 'APPAREL';
}

/**
 * Calls the /quotes endpoint for a single SKU + variant + country
 * Returns cost breakdown (basePrice, shippingCost, taxAmount, totalCost).
 */
async function getProdigiPricing(
  sku: string,
  variant: { attributes: { [k: string]: string } },
  countryCode: string
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
    // Sleep 1s to be courteous to the API
    await delay(1000);

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
                sku,
                copies: 1,
                attributes: variant.attributes,
                assets: [{ printArea: 'default' }],
              },
            ],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.warn(
              `Rate limit for SKU ${sku}, waiting 30s before retry...`
            );
            await delay(30000);
            return null;
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
      console.error(`No valid quotes for SKU ${sku}`);
      return null;
    }

    // Get the budget quote for base pricing
    const budgetQuote = validQuotes.find((q) => q?.method === 'Budget')?.quote;
    if (!budgetQuote) {
      console.error(`No budget quote available for SKU ${sku}`);
      return null;
    }

    const itemsArr = budgetQuote.items || [];
    if (!itemsArr.length) return null;

    const basePrice = Number.parseFloat(itemsArr[0]?.unitCost?.amount || '0');
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
      currency: itemsArr[0].unitCost.currency,
      basePrice,
      shippingCost,
      taxAmount,
      totalCost,
      customerPrice,
      fulfillmentCountryCode:
        budgetQuote.shipments?.[0]?.fulfillmentLocation?.countryCode || '',
      fulfillmentLabCode:
        budgetQuote.shipments?.[0]?.fulfillmentLocation?.labCode || '',
      availableShippingMethods: validQuotes.map((q) => q!.method),
    };
  } catch (error) {
    console.error(`Error fetching pricing for SKU ${sku}:`, error);
    return null;
  }
}

// Add export to the function
export async function updateProductData(sku: string) {
  try {
    console.log(`Fetching data for SKU: ${sku}`);

    if (!process.env.PRODIGI_API_KEY) {
      throw new Error('PRODIGI_API_KEY is not set in environment variables');
    }

    // 1) Pause to avoid hitting rate limits
    await delay(1000);

    const response = await fetch(
      `https://api.prodigi.com/v4.0/products/${sku}`,
      {
        headers: {
          'X-API-Key': process.env.PRODIGI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check for rate-limit
    if (response.status === 429) {
      console.warn(`429 rate limit for SKU ${sku}, waiting 30s...`);
      await delay(30000);
      return updateProductData(sku); // retry
    }

    if (!response.ok) {
      const text = await response.text();
      console.error(`API error for SKU [${sku}]:`, text);
      throw new Error(`API returned ${response.status}: ${text}`);
    }

    const rawText = await response.text();
    console.log(`Raw API Response for SKU [${sku}]:`, rawText);

    const data = JSON.parse(rawText) as ProdigiResponse;
    if (data.outcome === 'Ok' && data.product) {
      const product = data.product;
      console.log(`Processing product [${sku}]: ${product.description}`);

      // Gather all countries from the product's variants
      const variants = product.variants || [];
      const allCountries = new Set<string>();
      variants.forEach((v) => {
        v.shipsTo?.forEach((c) => allCountries.add(c));
      });

      console.log(
        `  => Found [${allCountries.size}] countries to process for SKU [${sku}]`
      );

      // For each country, fetch official pricing & upsert
      for (const countryCode of allCountries) {
        await delay(1000);

        // Pick a variant that ships to this country
        const variant = variants.find((v) => v.shipsTo.includes(countryCode));
        if (!variant) continue;

        const pricing = await getProdigiPricing(sku, variant, countryCode);
        if (!pricing) {
          console.warn(`No pricing data for [${sku}] in [${countryCode}]`);
          continue;
        }

        // 1) If there's a productType from Prodigi, use that; otherwise guess
        let productType = product.attributes.productType?.[0];
        if (!productType) {
          // fallback: guess from SKU or description
          productType = guessProductType(sku, product.description);
        }

        // Build the DB record data
        const productData = {
          description: product.description,
          name: product.description,
          width: product.productDimensions.width,
          height: product.productDimensions.height,
          units: product.productDimensions.units,

          brand: product.attributes.brand?.[0] || '',
          edge: product.attributes.edge?.[0] || '',
          color: product.attributes.color || [],
          gender: product.attributes.gender?.[0] || '',
          size: product.attributes.size || [],
          style: product.attributes.style?.[0] || '',
          productType,

          currency: pricing.currency,
          price: pricing.basePrice,
          shippingCost: pricing.shippingCost,
          taxAmount: pricing.taxAmount,
          totalCost: pricing.totalCost,
          customerPrice: pricing.customerPrice,
          stock: 10000,

          countryCode,
          fulfillmentCountryCode: pricing.fulfillmentCountryCode,
          fulfillmentLabCode: pricing.fulfillmentLabCode,

          // Store "prodigiDescription" or "prodigiVariants" if desired:
          prodigiDescription: product.description,
          prodigiAttributes: product.attributes,
          prodigiPrintAreas: {}, // not in your example, but optional
          prodigiVariants: product.variants,
        };

        // Create a composite SKU for each country
        const countrySku = `${product.sku}-${countryCode}`;

        await prisma.product.upsert({
          where: { sku: countrySku },
          update: productData,
          create: {
            ...productData,
            sku: countrySku,
            category: {
              connectOrCreate: {
                where: { name: productType },
                create: { name: productType },
              },
            },
          },
        });
        console.log(
          `  => Upserted [${countrySku}] with pricing in [${countryCode}]`
        );
      }
    } else {
      console.error(`Invalid or missing product data for SKU [${sku}]`, data);
    }
  } catch (error) {
    console.error(`Error processing SKU [${sku}]:`, error);
  }
}

// --------------------------------------------------
// SKUs List
// --------------------------------------------------
const skus = [
  // --------------------------------------------------
  // Men's T-shirts
  // --------------------------------------------------
  'GLOBAL-TEE-GIL-64000', // Classic 69.99 USD
  'AU3-TEE-U-B-3200', // Baseball top Australia only 69.99 USD
  'AU3-TEE-M-B-3006', // Long top 69.99 USD Australia only
  'GLOBAL-TEE-BC-3413', // Triblend 71.99 USD
  'TT-GIL-64200', // Tank top 68.99 USD
  'GLOBAL-TEE-GIL-64V00', // V-neck 69.99 USD
  'A-ML-GD2400', // Long sleeve 71.99 USD

  // --------------------------------------------------
  // Men's Hoodies
  // --------------------------------------------------
  'A-MH-JH050', // Zip up 79.99 USD
  'A-MH-JH001', // Pullover 79.99 USD

  // --------------------------------------------------
  // Women's T-shirts
  // --------------------------------------------------
  'A-WT-GD64000L', // Classic women 65.99 USD
  'GLOBAL-TEE-BC-6035', // V-neck 65.99 USD

  // --------------------------------------------------
  // Women's Hoodies
  // --------------------------------------------------
  'A-WH-JH001F', // 75.99 USD

  // --------------------------------------------------
  // Babies
  // --------------------------------------------------
  'A-BB-LA4411', // Babies Bodysuit  65.99 USD
  'GLOBAL-TEE-RS-3322', // Baby T-Shirt  65.99 USD

  // --------------------------------------------------
  // Kids
  // --------------------------------------------------
  'A-KT-GD64000B', // Kids T-shirt 65.99 USD
  'HOOD-AWD-JH001B', // Kids Hoodie 75.99 USD
  'SWEAT-AWD-JH030B', // Kids Sweatshirt 67.99 USD

  // --------------------------------------------------
  // Games
  // --------------------------------------------------
  'PLAY-CARD', // 18.45 USD
  'JIGSAW-PUZZLE-30', // 34.99 USD
  'JIGSAW-PUZZLE-110', // 37.99 USD
  'JIGSAW-PUZZLE-252', // 40.99 USD
  'JIGSAW-PUZZLE-500', // 43.99 USD
  'JIGSAW-PUZZLE-1000', // 49.99 USD

  // --------------------------------------------------
  // Accessories (Mats, Sleeves, etc.)
  // --------------------------------------------------
  'GLOBAL-GAMINGMAT', // 49.99 USD
  'GLOBAL-MOUSEMAT', // 19.99 USD
  'LAPTOP-SLEEVE-12IN', // 49.99 USD US Only
  'LAPTOP-SLEEVE-13IN', // 51.99 USD US Only
  'LAPTOP-SLEEVE-15IN', // 53.99 USD US Only

  // --------------------------------------------------
  // Pets
  // --------------------------------------------------
  'H-PET-SMALL-PB', // 49,99 USD
  'H-PET-MEDIUM-PB', // 69.99 USD
  'H-PET-LARGE-PB', // 79,99 USD
  'PET-BANDANA-SML', // 22.99 USD
  'PET-BANDANA-MED', //  23.99 USD
  'PET-BANDANA-LRG', // 24.99 USD
  'PET-MET-BONE', // 13.99 USD
  'PET-MET-ROUND', // 13.99 USD

  // --------------------------------------------------
  // Socks & Flip-flops
  // --------------------------------------------------
  'GLOBAL-TUBE-SOCKS', // 19.99 USD
  'GLOBAL-ANKLE-SOCKS', // 19.99 USD
  'M-FLIPFLOP-SML', // 29.99 USD
  'M-FLIPFLOP-MED', // 32.99 USD
  'M-FLIPFLOP-LRG', // 34.99 USD

  // --------------------------------------------------
  // Pendants & Keyrings
  // --------------------------------------------------
  'PEND-ROUND', // 13.99 USD
  'PEND-SQUARE', // 13.99 USD
  'PLA-KEYRING', // 14.99 USD
  'M-KEY-5X3_5', // 13.99 USD

  // --------------------------------------------------
  // Bags
  // --------------------------------------------------
  'H-BAG-LTOTE', // 29.99 USD

  // --------------------------------------------------
  // Books
  // --------------------------------------------------
  'BOOK-FE-A5-P-HARD-G', // 29.99 USD Hardcover example
  // Softcover, 72-hour lead time only
  'BOOK-FE-A4-L-SOFT-S', // 29.99 USD 12x9" Silk, 72h
  'BOOK-FE-A4-P-SOFT-S', // 29.99 USD 9x12" Silk, 72h
  'BOOK-FE-8_3-SQ-SOFT-S', // 24.99 USD 9x9" Silk, 72h
  'BOOK-FE-A5-L-SOFT-S', // 20.99 USD 9x6" Silk, 72h
  'BOOK-FE-A5-P-SOFT-S', // 20.99 USD 6x9" Silk, 72h

  // --------------------------------------------------
  // Home & Living
  // --------------------------------------------------
  // Drinkware
  'GLOBAL-MUG-W', // 19.99 USD
  'H-MUG-METAL-16OZ-B', // 55.99 USD
  '650ML-WATER-BOTTLE-BLACK', // 49.99 USD
  // Kitchen
  'H-APR-AA-BTIE', // 29.99 USD
  'H-APR-CA-BTIE', //25.99 USD
  'H-CUTTINGBOARD-GLASS', // 29.99 USD
  'H-CUTTINGBOARD-GLASS-CIRC', // 25.99 USD
  // Decor
  'PLANT-POT', // 25.99 USD
  'MET-TIN-ROU', // 26.99 USD
  'MET-TIN-REC', // 25.99 USD
  'GLOBAL-MINI-11X14', // 25.99 USD
  'H-COAST-2PK', // 19.99 USD
  'GLOBAL-POST-MOH-6X4', // 3 USD

  // --------------------------------------------------
  // NEW Apple Watch Straps
  // --------------------------------------------------
  'GLOBAL-TECH-AP-WS-FL-RG-38MM', // 59.99 USD
  'GLOBAL-TECH-AP-WS-FL-42MM', // 61.99 USD
  'GLOBAL-TECH-AP-WS-FL-38MM', // 59.99 USD
  'GLOBAL-TECH-AP-WS-FL-G-42MM', // 61.99 USD
  'GLOBAL-TECH-AP-WS-FL-RG-42MM', // 61.99 USD
  'GLOBAL-TECH-AP-WS-FL-G-38MM', // 59.99 USD
  'GLOBAL-TECH-AP-WS-FL-S-38MM', // 59.99 USD
  'GLOBAL-TECH-AP-WS-FL-S-42MM', // 61.99 USD

  // --------------------------------------------------
  // Cushions (72h lead time)
  // --------------------------------------------------
  'GLOBAL-CUSH-12X12-LIN',
  'GLOBAL-CUSH-12X12-LIN-DUAL',
  'GLOBAL-CUSH-12X12-SUE',
  'GLOBAL-CUSH-12X12-SUE-DUAL',
  'GLOBAL-CUSH-13X19-SUE-DUAL',
  'GLOBAL-CUSH-16X16-LIN',
  'GLOBAL-CUSH-16X16-LIN-DUAL',
  'GLOBAL-CUSH-16X16-SUE',
  'GLOBAL-CUSH-16X16-SUE-DUAL',
  'GLOBAL-CUSH-18X18-LIN',
  'GLOBAL-CUSH-18X18-LIN-DUAL',
  'GLOBAL-CUSH-18X18-SUE',
  'GLOBAL-CUSH-18X18-SUE-DUAL',
  'GLOBAL-CUSH-19X13-LIN',
  'GLOBAL-CUSH-22X22-LIN',
  'GLOBAL-CUSH-22X22-LIN-DUAL',
  'GLOBAL-CUSH-22X22-SUE',
  'GLOBAL-CUSH-22X22-SUE-DUAL',
  'GLOBAL-CUSH-24X24-LIN',
  'GLOBAL-CUSH-24X24-LIN-DUAL',
  'GLOBAL-CUSH-24X24-SUE',
  'GLOBAL-CUSH-24X24-SUE-DUAL',
  'GLOBAL-CUSH-13X19-LCDS',
  'GLOBAL-CUSH-13X19-SCDS',
  'GLOBAL-CUSH-13X19-SUE',

  // --------------------------------------------------
  // NEW Notebooks (48h lead time)
  // --------------------------------------------------
  'NB-GRAPH', // 19.99 USD 6x9" Graph
  'NB-LINED', // 19.99 USD 6x9" Lined
  'NB-GRAPH-A4', // 25.99 USD 9x12" Graph
  'NB-LINED-A4', // 25.99 USD 9x12" Lined

  // --------------------------------------------------
  // NEW Stickers
  // --------------------------------------------------
  'GLOBAL-STI-3X4-G', // 6.99 USD 3x4" Gloss
  'GLOBAL-STI-3X4-M', // 6.99 USD 3x4" Matt
  'GLOBAL-STI-5_5X5_5-G', // 9.99 USD 6x6" Gloss
  'GLOBAL-STI-5_5X5_5-M', // 9.99 USD 6x6" Matt

  // --------------------------------------------------
  // NEW Tattoos
  // --------------------------------------------------
  'GLOBAL-TATT-S', // 9.99 USD Small Tattoo
  'GLOBAL-TATT-M', // 16.99 USD Medium Tattoo

  // --------------------------------------------------
  // NEW Gallery Boards
  // --------------------------------------------------
  // Table Tops: Gallery Boards
  'GLOBAL-BOARD-10X12', // 10x12" Portrait / Landscape
  'GLOBAL-BOARD-10X10', // 10x10" Square
  'GLOBAL-BOARD-11X14', // 11x14" Portrait / Landscape
  'GLOBAL-BOARD-4X6', // 4x6" Portrait / Landscape
  'GLOBAL-BOARD-5X7', // 5x7" Portrait / Landscape
  'GLOBAL-BOARD-6X6', // 6x6" Square
  'GLOBAL-BOARD-8X10', // 8x10" Portrait / Landscape
  'GLOBAL-BOARD-8X8', // 8x8" Square
  'PIK-BOARD-3X4-5', // 3x5" Portrait / Landscape

  // Gallery Boards with Stands
  'GLOBAL-BOARD-10X12-STAND-2', // 10x12" with Stand
  'GLOBAL-BOARD-10X10-STAND-2', // 10x10" with Stand
  'GLOBAL-BOARD-11X14-STAND-2', // 11x14" with Stand
  'GLOBAL-BOARD-4X6-STAND-1', // 4x6" with Stand
  'GLOBAL-BOARD-5X7-STAND-1', // 5x7" with Stand
  'GLOBAL-BOARD-6X6-STAND-1', // 6x6" with Stand
  'GLOBAL-BOARD-8X10-STAND-2', // 8x10" with Stand
  'GLOBAL-BOARD-8X8-STAND-2', // 8x8" with Stand

  // --------------------------------------------------
  // NEW Acrylic Prisms
  // --------------------------------------------------
  'GLOBAL-MOU-PRISM-4X4', // 4x4" Square Acrylic
  'GLOBAL-MOU-PRISM-4X4-TRANS', // 4x4" Square Acrylic Translucent
  'GLOBAL-MOU-PRISM-4X6', // 4x6" Portrait / Landscape Acrylic
  'GLOBAL-MOU-PRISM-4X6-TRANS', // 4x6" Portrait / Landscape Acrylic Translucent
  'GLOBAL-MOU-PRISM-5X5', // 5x5" Square Acrylic
  'GLOBAL-MOU-PRISM-5X5-TRANS', // 5x5" Square Acrylic Translucent
  'GLOBAL-MOU-PRISM-5X7', // 5x7" Portrait / Landscape Acrylic
  'GLOBAL-MOU-PRISM-5X7-TRANS', // 5x7" Portrait / Landscape Acrylic Translucent
  'GLOBAL-MOU-PRISM-6X6', // 6x6" Square Acrylic
  'GLOBAL-MOU-PRISM-6X6-TRANS', // 6x6" Square Acrylic Translucent
  'GLOBAL-MOU-PRISM-6X8', // 6x8" Portrait / Landscape Acrylic
  'GLOBAL-MOU-PRISM-6X8-TRANS', // 6x8" Portrait / Landscape Acrylic Translucent

  // --------------------------------------------------
  // NEW Prints and Posters (Glow in the Dark)
  // --------------------------------------------------
  'ART-GITD-12X16', // 12x16" Portrait / Landscape, 350gsm
  'ART-GITD-305X305', // 12x12" Square, 350gsm
  'ART-GITD-11X14', // 11x14" Portrait / Landscape, 350gsm
  'ART-GITD-16X32', // 16x32" Portrait / Landscape, 350gsm
  'ART-GITD-305X406', // 12x16" Portrait / Landscape, 350gsm
  'ART-GITD-20X28', // 20x28" Portrait / Landscape, 350gsm
  'ART-GITD-10X10', // 10x10" Square, 350gsm
  'ART-GITD-10X20', // 10x20" Portrait / Landscape, 350gsm
  'ART-GITD-20X20', // 20x20" Square, 350gsm
  'ART-GITD-12X12', // 12x12" Square, 350gsm
  'ART-GITD-4X6', // 4x6" Portrait / Landscape, 350gsm
  'ART-GITD-6X6', // 6x6" Square, 350gsm
  'ART-GITD-6X8', // 6x8" Portrait / Landscape, 350gsm
  'ART-GITD-8X10', // 8x10" Portrait / Landscape, 350gsm
  'ART-GITD-8X12', // 8x12" Portrait / Landscape, 350gsm
  'ART-GITD-8X8', // 8x8" Square, 350gsm
  'ART-GITD-A3', // 12x17" Portrait / Landscape, 350gsm
  'ART-GITD-A4', // 9x12" Portrait / Landscape, 350gsm
  'ART-GITD-9X12', // 9x12" Portrait / Landscape, 350gsm

  // --------------------------------------------------
  // NEW Lustre Photo Paper
  // --------------------------------------------------
  'GLOBAL-PAP-10X10', // 10x10" Square, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-10X12', // 10x12" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-10X20', // 10x20" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-11X14', // 11x14" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-11X17', // 11x17" Portrait / Landscape, LPP, 240gsm, 36-72h
  'GLOBAL-PAP-12X12', // 12x12" Square, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-12X16', // 12x16" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-12X18', // 12x18" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-12X24', // 12x24" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-16X16', // 16x16" Square, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-28X28', // 28x28" Square, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-30X30', // 30x30" Square, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-4X6', // 4x6" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-5X7', // 5x7" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-6X6', // 6x6" Square, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-6X8', // 6x8" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-8X10', // 8x10" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-8X12', // 8x12" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-8X16', // 8x16" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-8X8', // 8x8" Square, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-A3', // 12x17" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-A4', // 9x12" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-A5', // 6x9" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-10X30', // 10x30" Portrait / Landscape, LPP, 240gsm, 48-72h
  'GLOBAL-PAP-12X36', // 12x36" Portrait / Landscape, LPP, 240gsm, 48-72h

  // --------------------------------------------------
  // NEW Hahnemühle German Etching
  // --------------------------------------------------
  'GLOBAL-HGE-10X10', // 10x10" Square, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-10X20', // 10x20" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-11X14', // 11x14" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-16X16', // 16x16" Square, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-16X20', // 16x20" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-16X24', // 16x24" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-16X32', // 16x32" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-18X24', // 18x24" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-20X20', // 20x20" Square, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-4X6', // 4x6" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-6X6', // 6x6" Square, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-6X8', // 6x8" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-8X10', // 8x10" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-8X8', // 8x8" Square, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-A2', // 17x24" Portrait / Landscape, HGE, 310gsm, 48-72h
  'GLOBAL-HGE-A5', // 6x9" Portrait / Landscape, HGE, 310gsm, 48-72h
  'ART-HGE-10X10', // 10x10" Square, HGE, 310gsm, 48h
  'ART-HGE-16X16', // 16x16" Square, HGE, 310gsm, 48h
  'ART-HGE-8X8', // 8x8" Square, HGE, 310gsm, 48h
  'GLOBAL-HGE-11X17', // 11x17" Portrait / Landscape, HGE, 310gsm, 48h
  'GLOBAL-HGE-12X36', // 12x36" Portrait / Landscape, HGE, 310gsm, 48h
  'GLOBAL-HGE-13_5X14', // 14x15" Portrait / Landscape, HGE, 310gsm, 48h
  'GLOBAL-HGE-13_6X32_5', // 6x13" Portrait / Landscape, HGE, 310gsm, 48h
  'GLOBAL-HGE-18X18', // 18x18" Square, HGE, 310gsm, 48h
  'GLOBAL-HGE-20_4X48_7', // 8x20" Portrait / Landscape, HGE, 310gsm, 48h
];

async function main() {
  console.log('Starting updateProducts process...');
  for (const sku of skus) {
    await updateProductData(sku);
  }
  console.log('All SKUs processed. Exiting...');
}

main()
  .catch((e) => console.error('Error in main:', e))
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected.');
  });
