import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkVariants() {
  try {
    console.log('Checking variant products...\n');

    // Check for parent products
    const parentProducts = await prisma.product.findMany({
      where: {
        isVariantProduct: true,
        countryCode: 'US',
      },
      include: {
        variants: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        variantOptions: true,
      },
    });

    console.log(`Found ${parentProducts.length} parent products for US\n`);

    parentProducts.forEach((product) => {
      console.log(`- ${product.name} (${product.sku})`);
      console.log(`  Listed: ${product.listed}`);
      console.log(`  Variants: ${product.variants?.length || 0}`);
      console.log(`  Options: ${product.variantOptions?.length || 0}`);
      console.log('');
    });

    // Check for child products
    const childProducts = await prisma.product.count({
      where: {
        parentProductId: { not: null },
        countryCode: 'US',
      },
    });

    console.log(`Found ${childProducts} variant child products for US\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariants();
