import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { updateProductData } from './updateProducts.js';

dotenv.config();

const BATCH_SIZE = 5;
const DELAY_BETWEEN_PRODUCTS = 1000;
const RATE_LIMIT_DELAY = 30000;
const RETRY_DELAY = 5000;
const PROGRESS_FILE = path.join(__dirname, 'processed_skus.json');

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadProcessedSKUs(): Promise<Set<string>> {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      return new Set(JSON.parse(data));
    }
  } catch (error) {
    console.error('Error loading processed SKUs:', error);
  }
  return new Set();
}

async function saveProcessedSKUs(skus: Set<string>): Promise<void> {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(Array.from(skus)));
  } catch (error) {
    console.error('Error saving processed SKUs:', error);
  }
}

async function processProduct(
  sku: string,
  processedSKUs: Set<string>
): Promise<void> {
  if (processedSKUs.has(sku)) {
    console.log(`Skipping already processed SKU: ${sku}`);
    return;
  }

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      await updateProductData(sku);
      processedSKUs.add(sku);
      await saveProcessedSKUs(processedSKUs);
      return;
    } catch (error: any) {
      if (error.message?.includes('rate limit') && retries < maxRetries - 1) {
        console.log(
          `Rate limit for SKU ${sku}, waiting ${RATE_LIMIT_DELAY / 1000}s before retry...`
        );
        await delay(RATE_LIMIT_DELAY);
        retries++;
      } else {
        console.error(`Error processing SKU ${sku}:`, error);
        return;
      }
    }
  }
}

async function processBatch(
  skus: string[],
  processedSKUs: Set<string>
): Promise<void> {
  const promises = skus.map((sku) => processProduct(sku, processedSKUs));
  await Promise.all(promises);
  await delay(DELAY_BETWEEN_PRODUCTS);
}

export async function clearAndUpdateProducts(
  skipCleanup = false
): Promise<void> {
  const prisma = new PrismaClient();
  const processedSKUs = await loadProcessedSKUs();

  try {
    if (skipCleanup) {
      console.log(
        `Resuming from ${processedSKUs.size} previously processed SKUs`
      );
    } else {
      console.log('Cleaning up existing products...');
      const deletedProducts = await prisma.product.deleteMany({});
      console.log(`Deleted ${deletedProducts.count} products`);

      console.log('Cleaning up existing categories...');
      await prisma.category.deleteMany({});
      console.log('Categories cleaned up');

      // Clear progress file when starting fresh
      if (fs.existsSync(PROGRESS_FILE)) {
        fs.unlinkSync(PROGRESS_FILE);
      }
    }

    const skus = [
      // Men's T-shirts
      'GLOBAL-TEE-GIL-64000',
      'AU3-TEE-M-B-3006',
      // Women's T-shirts
      'AU3-TEE-U-B-3200',
      // Hoodies
      'SWEAT-AWD-JH030',
      // Kids T-shirts
      'TEE-BC-3006',
      // Women's Hoodies
      'GLOBAL-TEE-BC-3413',
    ];

    const remainingSkus = skus.filter((sku) => !processedSKUs.has(sku));
    console.log(`Processing ${remainingSkus.length} remaining SKUs`);

    for (let i = 0; i < remainingSkus.length; i += BATCH_SIZE) {
      const batch = remainingSkus.slice(i, i + BATCH_SIZE);
      await processBatch(batch, processedSKUs);
      console.log(`Processed ${processedSKUs.size}/${skus.length} SKUs`);
    }

    console.log('Finished processing all SKUs');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  clearAndUpdateProducts(true).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
