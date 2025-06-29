import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { updateProductData } from './updateProducts.js';

dotenv.config();

// Configuration
const BATCH_SIZE = 5; // Process 5 products at a time
const DELAY_BETWEEN_PRODUCTS = 1000; // 1 second between products
const RATE_LIMIT_DELAY = 30000; // 30 seconds
const RETRY_DELAY = 5000; // 5 seconds between retries
const MAX_RETRIES = 3;

// All SKUs to process
const skus = [
  // Men's T-shirts
  'GLOBAL-TEE-GIL-64000', // Classic
  'AU3-TEE-U-B-3200', // Baseball top
  'TEE-BC-3006', // Long top
  'AU3-TEE-M-B-3006',
  'GLOBAL-TEE-BC-3413', // Triblend
  'TT-GIL-64200', // Tank top
  'GLOBAL-TEE-GIL-64V00', // V-neck
  'A-ML-GD2400', // Long sleeve

  // Men's Hoodies
  'A-MH-JH050', // Zip up
  'A-MH-JH001', // Pullover

  // Women's T-shirts
  'A-WT-GD64000L', // Classic women
  'GLOBAL-TEE-BC-6035', // V-neck

  // Women's Hoodies
  'A-WH-JH001F',

  // Babies
  'A-BB-LA4411', // Babies Bodysuit
  'GLOBAL-TEE-RS-3322', // Baby T-Shirt

  // Kids
  'A-KT-GD64000B', // Kids T-shirt
  'HOOD-AWD-JH001B', // Kids Hoodie
  'SWEAT-AWD-JH030B', // Kids Sweatshirt

  // Games
  'PLAY-CARD',
  'JIGSAW-PUZZLE-30',
  'JIGSAW-PUZZLE-110',
  'JIGSAW-PUZZLE-252',
  'JIGSAW-PUZZLE-500',
  'JIGSAW-PUZZLE-1000',

  // Accessories (Mats, Sleeves, etc.)
  'GLOBAL-GAMINGMAT',
  'GLOBAL-MOUSEMAT',
  'LAPTOP-SLEEVE-12IN',
  'LAPTOP-SLEEVE-13IN',
  'LAPTOP-SLEEVE-15IN',

  // Pets
  'H-PET-SMALL-PB',
  'H-PET-MEDIUM-PB',
  'H-PET-LARGE-PB',
  'PET-BANDANA-SML',
  'PET-BANDANA-MED',
  'PET-BANDANA-LRG',
  'PET-MET-BONE',
  'PET-MET-ROUND',

  // Socks & Flip-flops
  'GLOBAL-TUBE-SOCKS',
  'GLOBAL-ANKLE-SOCKS',
  'M-FLIPFLOP-SML',
  'M-FLIPFLOP-MED',
  'M-FLIPFLOP-LRG',

  // Pendants & Keyrings
  'PEND-ROUND',
  'PEND-SQUARE',
  'PLA-KEYRING',
  'M-KEY-5X3_5',

  // Bags
  'H-BAG-LTOTE',

  // Books
  'BOOK-FE-A5-P-HARD-G', // Hardcover example
  'BOOK-FE-A4-L-SOFT-S', // 12x9" Silk, 72h
  'BOOK-FE-A4-P-SOFT-S', // 9x12" Silk, 72h
  'BOOK-FE-8_3-SQ-SOFT-S', // 9x9" Silk, 72h
  'BOOK-FE-A5-L-SOFT-S', // 9x6" Silk, 72h
  'BOOK-FE-A5-P-SOFT-S', // 6x9" Silk, 72h

  // Home & Living
  // Drinkware
  'GLOBAL-MUG-W',
  'H-MUG-METAL-16OZ-B',
  '650ML-WATER-BOTTLE-BLACK',
  // Kitchen
  'H-APR-AA-BTIE',
  'H-APR-CA-BTIE',
  'H-CUTTINGBOARD-GLASS',
  'H-CUTTINGBOARD-GLASS-CIRC',
  // Decor
  'PLANT-POT',
  'MET-TIN-ROU',
  'MET-TIN-REC',
  'GLOBAL-MINI-11X14',
  'H-COAST-2PK',
  'GLOBAL-POST-MOH-6X4',

  // NEW Apple Watch Straps
  'GLOBAL-TECH-AP-WS-FL-RG-38MM',
  'GLOBAL-TECH-AP-WS-FL-42MM',
  'GLOBAL-TECH-AP-WS-FL-38MM',
  'GLOBAL-TECH-AP-WS-FL-G-42MM',
  'GLOBAL-TECH-AP-WS-FL-RG-42MM',
  'GLOBAL-TECH-AP-WS-FL-G-38MM',
  'GLOBAL-TECH-AP-WS-FL-S-38MM',
  'GLOBAL-TECH-AP-WS-FL-S-42MM',

  // Cushions (72h lead time)
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

  // NEW Notebooks (48h lead time)
  'NB-GRAPH', // 6x9" Graph
  'NB-LINED', // 6x9" Lined
  'NB-GRAPH-A4', // 9x12" Graph
  'NB-LINED-A4', // 9x12" Lined

  // NEW Stickers
  'GLOBAL-STI-3X4-G', // 3x4" Gloss
  'GLOBAL-STI-3X4-M', // 3x4" Matt
  'GLOBAL-STI-5_5X5_5-G', // 6x6" Gloss
  'GLOBAL-STI-5_5X5_5-M', // 6x6" Matt

  // NEW Tattoos
  'GLOBAL-TATT-S', // Small Tattoo
  'GLOBAL-TATT-M', // Medium Tattoo

  // NEW Gallery Boards
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

  // NEW Acrylic Prisms
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

  // NEW Prints and Posters (Glow in the Dark)
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

  // NEW Lustre Photo Paper
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

  // NEW Hahnemühle German Etching
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

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Get list of countries to process
async function getCountries(): Promise<string[]> {
  // This is a placeholder - replace with actual country fetching logic
  return ['US', 'GB', 'CA', 'AU']; // Example countries
}

// Process a single product with retries and rate limit handling
async function processProduct(
  sku: string,
  country: string,
  retryCount = 0
): Promise<boolean> {
  try {
    await updateProductData(sku);
    console.log(`  => Upserted [${sku}] with pricing in [${country}]`);
    return true;
  } catch (error: any) {
    if (error.message?.includes('rate limit') && retryCount < MAX_RETRIES) {
      console.log(
        `Rate limit hit for SKU ${sku}, waiting ${RATE_LIMIT_DELAY / 1000}s before retry...`
      );
      await delay(RATE_LIMIT_DELAY);
      return processProduct(sku, country, retryCount + 1);
    }
    console.error(
      `Failed to process SKU ${sku} for country ${country}:`,
      error
    );
    return false;
  }
}

// Process products in batches
async function processBatch(skusToProcess: string[], countries: string[]) {
  let processed = 0;
  let failed = 0;
  const total = skusToProcess.length * countries.length;

  for (let i = 0; i < skusToProcess.length; i += BATCH_SIZE) {
    const batch = skusToProcess.slice(i, i + BATCH_SIZE);

    for (const country of countries) {
      const results = await Promise.all(
        batch.map((sku) => processProduct(sku, country))
      );

      processed += results.filter((success) => success).length;
      failed += results.filter((success) => !success).length;

      // Add a small delay between batches to avoid overwhelming the API
      await delay(RETRY_DELAY);

      // Log progress
      const progress = (((processed + failed) / total) * 100).toFixed(1);
      console.log(
        `Progress: ${progress}% (${processed} succeeded, ${failed} failed)`
      );
    }
  }

  return { processed, failed };
}

// Main function to clear and update products
async function clearAndUpdateProducts(skipCleanup = false) {
  const prisma = new PrismaClient();
  let skusToProcess = [...skus]; // Create a copy of the SKUs array

  try {
    if (skipCleanup) {
      // Get list of already processed products
      const existingProducts = await prisma.product.findMany({
        select: { sku: true },
      });
      const processedSkus = new Set(existingProducts.map((p) => p.sku));

      // Filter out already processed SKUs
      skusToProcess = skusToProcess.filter((sku) => !processedSkus.has(sku));
      console.log(
        `Resuming with ${skusToProcess.length} remaining unprocessed SKUs`
      );
    } else {
      // Delete existing products
      const deletedProducts = await prisma.product.deleteMany({});
      console.log(`Deleted ${deletedProducts.count} existing products`);

      // Delete existing categories
      await prisma.category.deleteMany({});
      console.log('Deleted existing categories');
    }

    // Get list of countries to process
    const countries = await getCountries();
    console.log(
      `Processing ${skusToProcess.length} products for ${countries.length} countries`
    );

    const { processed, failed } = await processBatch(skusToProcess, countries);
    console.log(`\nCompleted processing:`);
    console.log(`- Successfully processed: ${processed}`);
    console.log(`- Failed to process: ${failed}`);
  } catch (error) {
    console.error('Error during product update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function
export { clearAndUpdateProducts };

// If this file is run directly, execute the function
if (import.meta.url === `file://${process.argv[1]}`) {
  // Pass true to skip cleanup when resuming
  clearAndUpdateProducts(true).catch(console.error);
}
