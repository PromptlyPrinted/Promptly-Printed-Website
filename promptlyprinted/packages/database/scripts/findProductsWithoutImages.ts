import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function findProductsWithoutImages() {
  const products = await prisma.product.findMany({
    where: {
      countryCode: 'US',
      listed: true,
    },
    select: {
      name: true,
      sku: true,
      prodigiVariants: true,
      isVariantProduct: true,
      parentProductId: true,
    },
  });

  console.log('Products without image paths:\n');
  const missing: Array<{ name: string; sku: string }> = [];

  products.forEach((p) => {
    // Skip child variants
    if (p.parentProductId) return;

    const pv = p.prodigiVariants as any;
    const imgPath = pv?.imageUrls?.productImage || pv?.imageUrls?.cover;
    if (!imgPath || imgPath.includes('undefined') || imgPath === '') {
      missing.push({ name: p.name, sku: p.sku });
      console.log(`- ${p.name} (${p.sku})`);
    }
  });

  console.log(`\nTotal: ${missing.length} products without images`);

  await prisma.$disconnect();
  return missing;
}

findProductsWithoutImages();
