import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('Testing variant product query...\n');

    const products = await prisma.product.findMany({
      where: {
        listed: true,
        countryCode: 'US',
        OR: [
          { isVariantProduct: true }, // Show parent products with variants
          { parentProductId: null, isVariantProduct: false }, // Show products without variants
        ],
      },
      include: {
        category: true,
        variants: {
          select: {
            id: true,
            sku: true,
            name: true,
            price: true,
            variantAttributes: true,
            stock: true,
          },
        },
        variantOptions: {
          select: {
            optionName: true,
            optionValue: true,
            displayOrder: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
      take: 5, // Only fetch 5 for testing
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`Found ${products.length} products\n`);

    products.forEach((product) => {
      console.log(`- ${product.name}`);
      console.log(`  SKU: ${product.sku}`);
      console.log(`  Is Variant Product: ${product.isVariantProduct}`);
      console.log(`  Variant Count: ${product.variants?.length || 0}`);
      console.log(`  Variant Options: ${product.variantOptions?.length || 0}`);
      if (product.variantOptions && product.variantOptions.length > 0) {
        product.variantOptions.forEach(opt => {
          console.log(`    - ${opt.optionName}: ${opt.optionValue}`);
        });
      }
      console.log('');
    });

    console.log('✓ Query successful!');
  } catch (error) {
    console.error('❌ Query failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
