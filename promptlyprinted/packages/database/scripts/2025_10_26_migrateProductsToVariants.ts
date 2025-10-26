import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Product Variant Migration Script
 *
 * This script migrates existing products into a variant-based system where
 * products with different sizes, colors, finishes, etc. are grouped together
 * as variants of a single parent product.
 */

// Define which products should be grouped as variants
const VARIANT_GROUPS = {
  'Apple Watch Band': {
    skuPatterns: [
      'GLOBAL-TECH-AP-WS-FL-RG-38MM',
      'GLOBAL-TECH-AP-WS-FL-42MM',
      'GLOBAL-TECH-AP-WS-FL-38MM',
      'GLOBAL-TECH-AP-WS-FL-G-42MM',
      'GLOBAL-TECH-AP-WS-FL-RG-42MM',
      'GLOBAL-TECH-AP-WS-FL-G-38MM',
      'GLOBAL-TECH-AP-WS-FL-S-38MM',
      'GLOBAL-TECH-AP-WS-FL-S-42MM',
    ],
    variantExtractor: (sku: string) => {
      const size = sku.includes('38MM') ? '38mm' : '42mm';
      let finish = 'Standard';
      if (sku.includes('-RG-')) finish = 'Rose Gold';
      else if (sku.includes('-G-')) finish = 'Gold';
      else if (sku.includes('-S-')) finish = 'Silver';

      return { size, finish };
    },
    parentSku: 'PARENT-WATCH-BAND',
    parentName: 'Apple Watch Band',
    parentDescription: 'Custom Apple Watch band available in multiple sizes and finishes.',
  },

  'Sticker': {
    skuPatterns: [
      'GLOBAL-STI-3X4-G',
      'GLOBAL-STI-3X4-M',
      'GLOBAL-STI-5_5X5_5-G',
      'GLOBAL-STI-5_5X5_5-M',
    ],
    variantExtractor: (sku: string) => {
      const size = sku.includes('3X4') ? '3x4"' : '6x6"';
      const finish = sku.endsWith('-G') ? 'Glossy' : 'Matte';

      return { size, finish };
    },
    parentSku: 'PARENT-STICKER',
    parentName: 'Custom Sticker',
    parentDescription: 'Custom printed sticker available in multiple sizes and finishes.',
  },

  'Laptop Sleeve': {
    skuPatterns: [
      'LAPTOP-SLEEVE-12IN',
      'LAPTOP-SLEEVE-13IN',
      'LAPTOP-SLEEVE-15IN',
    ],
    variantExtractor: (sku: string) => {
      let size = '13"';
      if (sku.includes('12IN')) size = '12"';
      else if (sku.includes('15IN')) size = '15"';

      return { size };
    },
    parentSku: 'PARENT-LAPTOP-SLEEVE',
    parentName: 'Laptop Sleeve',
    parentDescription: 'Protective laptop sleeve available in multiple sizes (US Only).',
  },

  'Flip-Flops': {
    skuPatterns: [
      'M-FLIPFLOP-SML',
      'M-FLIPFLOP-MED',
      'M-FLIPFLOP-LRG',
    ],
    variantExtractor: (sku: string) => {
      let size = 'Medium';
      if (sku.includes('SML')) size = 'Small';
      else if (sku.includes('LRG')) size = 'Large';

      return { size };
    },
    parentSku: 'PARENT-FLIPFLOP',
    parentName: 'Flip-Flops',
    parentDescription: 'Custom designed flip-flops available in multiple sizes.',
  },

  'Pet Bed': {
    skuPatterns: [
      'H-PET-SMALL-PB',
      'H-PET-MEDIUM-PB',
      'H-PET-LARGE-PB',
    ],
    variantExtractor: (sku: string) => {
      let size = 'Medium';
      if (sku.includes('SMALL')) size = 'Small';
      else if (sku.includes('LARGE')) size = 'Large';

      return { size };
    },
    parentSku: 'PARENT-PET-BED',
    parentName: 'Pet Bed',
    parentDescription: 'Cozy bed for pets with custom printed design, available in multiple sizes.',
  },

  'Pet Bandana': {
    skuPatterns: [
      'PET-BANDANA-SML',
      'PET-BANDANA-MED',
      'PET-BANDANA-LRG',
    ],
    variantExtractor: (sku: string) => {
      let size = 'Medium';
      if (sku.includes('SML')) size = 'Small';
      else if (sku.includes('LRG')) size = 'Large';

      return { size };
    },
    parentSku: 'PARENT-PET-BANDANA',
    parentName: 'Pet Bandana',
    parentDescription: 'Stylish bandana for pets with adjustable fit, available in multiple sizes.',
  },

  'Pet Tag': {
    skuPatterns: [
      'PET-MET-BONE',
      'PET-MET-ROUND',
    ],
    variantExtractor: (sku: string) => {
      const shape = sku.includes('BONE') ? 'Bone' : 'Round';

      return { shape };
    },
    parentSku: 'PARENT-PET-TAG',
    parentName: 'Pet ID Tag',
    parentDescription: 'Custom pet ID tag available in multiple shapes.',
  },

  'Notebook': {
    skuPatterns: [
      'NB-GRAPH',
      'NB-LINED',
      'NB-GRAPH-A4',
      'NB-LINED-A4',
    ],
    variantExtractor: (sku: string) => {
      const size = sku.includes('A4') ? '9x12"' : '6x9"';
      const type = sku.includes('GRAPH') ? 'Graph' : 'Lined';

      return { size, type };
    },
    parentSku: 'PARENT-NOTEBOOK',
    parentName: 'Notebook',
    parentDescription: 'Custom notebook available in multiple sizes and paper types.',
  },

  'Temporary Tattoo': {
    skuPatterns: [
      'GLOBAL-TATT-S',
      'GLOBAL-TATT-M',
    ],
    variantExtractor: (sku: string) => {
      const size = sku.endsWith('-S') ? 'Small (2x3")' : 'Medium (3x4")';

      return { size };
    },
    parentSku: 'PARENT-TATTOO',
    parentName: 'Temporary Tattoo',
    parentDescription: 'Custom temporary tattoo available in multiple sizes.',
  },

  'Jigsaw Puzzle': {
    skuPatterns: [
      'JIGSAW-PUZZLE-30',
      'JIGSAW-PUZZLE-110',
      'JIGSAW-PUZZLE-252',
      'JIGSAW-PUZZLE-500',
      'JIGSAW-PUZZLE-1000',
    ],
    variantExtractor: (sku: string) => {
      let pieces = '500';
      if (sku.includes('30')) pieces = '30';
      else if (sku.includes('110')) pieces = '110';
      else if (sku.includes('252')) pieces = '252';
      else if (sku.includes('1000')) pieces = '1000';

      return { pieces };
    },
    parentSku: 'PARENT-PUZZLE',
    parentName: 'Jigsaw Puzzle',
    parentDescription: 'Custom jigsaw puzzle available in multiple piece counts.',
  },
};

async function addDatabaseColumns() {
  console.log('Adding new columns to Product table...');

  try {
    // Add columns using raw SQL
    await prisma.$executeRaw`
      ALTER TABLE "Product"
      ADD COLUMN IF NOT EXISTS "isVariantProduct" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "parentProductId" INTEGER,
      ADD COLUMN IF NOT EXISTS "variantAttributes" JSONB;
    `;

    // Add indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Product_parentProductId_idx" ON "Product"("parentProductId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Product_isVariantProduct_idx" ON "Product"("isVariantProduct");
    `;

    console.log('✓ Columns and indexes added successfully');
  } catch (error) {
    console.error('Error adding columns:', error);
    throw error;
  }
}

async function createVariantOptionsTable() {
  console.log('Creating ProductVariantOption table...');

  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ProductVariantOption" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL,
        "optionName" TEXT NOT NULL,
        "optionValue" TEXT NOT NULL,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductVariantOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    // Add unique constraint
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariantOption_productId_optionName_optionValue_key"
      ON "ProductVariantOption"("productId", "optionName", "optionValue");
    `;

    // Add index on productId
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ProductVariantOption_productId_idx" ON "ProductVariantOption"("productId");
    `;

    console.log('✓ ProductVariantOption table created successfully');
  } catch (error) {
    console.error('Error creating ProductVariantOption table:', error);
    throw error;
  }
}

async function migrateProductGroup(
  groupName: string,
  config: typeof VARIANT_GROUPS[keyof typeof VARIANT_GROUPS]
) {
  console.log(`\nMigrating ${groupName}...`);

  const { skuPatterns, variantExtractor, parentSku, parentName, parentDescription } = config;

  // Get all products for each country that match any of the SKU patterns
  const countries = [
    'US', 'GB', 'DE', 'AU', 'FR', 'CH', 'SE', 'AE', 'ES', 'IT',
    'NL', 'DK', 'NO', 'NZ', 'IE', 'KR', 'JP', 'BE', 'SG', 'CN'
  ];

  for (const countryCode of countries) {
    try {
      // Find all variant products for this country
      const variantProducts = await prisma.product.findMany({
        where: {
          sku: { in: skuPatterns },
          countryCode,
        },
      });

      if (variantProducts.length === 0) {
        console.log(`  No products found for ${countryCode}, skipping...`);
        continue;
      }

      console.log(`  Processing ${countryCode}: Found ${variantProducts.length} variant(s)`);

      // Use the first variant product as a template for the parent
      const template = variantProducts[0];

      // Create or find the parent product
      const parentProduct = await prisma.product.upsert({
        where: {
          sku_countryCode: {
            sku: parentSku,
            countryCode,
          },
        },
        update: {
          name: parentName,
          description: parentDescription,
          isVariantProduct: true,
          listed: true,
          updatedAt: new Date(),
        },
        create: {
          sku: parentSku,
          name: parentName,
          description: parentDescription,
          price: template.price,
          customerPrice: template.customerPrice,
          stock: variantProducts.reduce((sum, p) => sum + p.stock, 0),
          currency: template.currency,
          categoryId: template.categoryId,
          productType: template.productType,
          listed: true,
          brand: template.brand,
          color: template.color,
          countryCode,
          edge: template.edge,
          gender: template.gender,
          height: template.height,
          shippingCost: template.shippingCost,
          size: template.size,
          style: template.style,
          taxAmount: template.taxAmount,
          totalCost: template.totalCost,
          units: template.units,
          width: template.width,
          isVariantProduct: true,
          fulfillmentCountryCode: template.fulfillmentCountryCode,
          fulfillmentLabCode: template.fulfillmentLabCode,
          prodigiAttributes: template.prodigiAttributes,
          prodigiDescription: template.prodigiDescription,
          prodigiPrintAreas: template.prodigiPrintAreas,
          prodigiVariants: template.prodigiVariants,
        },
      });

      console.log(`  ✓ Created/updated parent product: ${parentProduct.id}`);

      // Collect all variant options
      const variantOptions = new Set<string>();

      // Update each variant product to link to the parent
      for (const variant of variantProducts) {
        const attributes = variantExtractor(variant.sku);

        // Track variant options
        for (const [key, value] of Object.entries(attributes)) {
          variantOptions.add(`${key}:${value}`);
        }

        await prisma.product.update({
          where: { id: variant.id },
          data: {
            parentProductId: parentProduct.id,
            variantAttributes: attributes,
            listed: false, // Hide variants, show only parent
          },
        });

        console.log(`    → Linked variant ${variant.sku} with attributes:`, attributes);
      }

      // Create ProductVariantOption entries for the parent
      for (const option of variantOptions) {
        const [optionName, optionValue] = option.split(':');

        await prisma.$executeRaw`
          INSERT INTO "ProductVariantOption" ("productId", "optionName", "optionValue", "displayOrder", "createdAt", "updatedAt")
          VALUES (${parentProduct.id}, ${optionName}, ${optionValue}, 0, NOW(), NOW())
          ON CONFLICT ("productId", "optionName", "optionValue") DO NOTHING;
        `;
      }

      console.log(`  ✓ Created ${variantOptions.size} variant option(s) for ${countryCode}`);
    } catch (error) {
      console.error(`  ✗ Error processing ${countryCode}:`, error);
    }
  }

  console.log(`✓ Completed migration for ${groupName}`);
}

async function main() {
  try {
    console.log('=== Product Variant Migration ===\n');

    // Step 1: Add database columns
    await addDatabaseColumns();

    // Step 2: Create ProductVariantOption table
    await createVariantOptionsTable();

    // Step 3: Migrate each product group
    for (const [groupName, config] of Object.entries(VARIANT_GROUPS)) {
      await migrateProductGroup(groupName, config);
    }

    console.log('\n=== Migration Complete ===');
    console.log('\nSummary:');
    console.log(`- ${Object.keys(VARIANT_GROUPS).length} product groups migrated`);
    console.log('- Parent products created for each country');
    console.log('- Variant products linked to parents');
    console.log('- Variant products hidden from listings');
    console.log('- ProductVariantOption entries created');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
