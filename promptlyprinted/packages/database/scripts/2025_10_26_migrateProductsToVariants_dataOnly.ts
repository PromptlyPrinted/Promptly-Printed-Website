import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Product Variant Data Migration Script
 *
 * Prerequisites:
 * 1. The schema must already be updated with variant fields
 * 2. Run: pnpm --filter @repo/database exec prisma db push
 *
 * This script only migrates the data, it does not modify the schema.
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

  let totalParents = 0;
  let totalVariants = 0;
  let totalOptions = 0;

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

      totalParents++;
      console.log(`  ✓ Created/updated parent product: ${parentProduct.id}`);

      // Collect all unique variant option combinations
      const variantOptionsMap = new Map<string, Set<string>>();

      // Update each variant product to link to the parent
      for (const variant of variantProducts) {
        const attributes = variantExtractor(variant.sku);

        // Track variant options
        for (const [key, value] of Object.entries(attributes)) {
          if (!variantOptionsMap.has(key)) {
            variantOptionsMap.set(key, new Set());
          }
          variantOptionsMap.get(key)!.add(value);
        }

        await prisma.product.update({
          where: { id: variant.id },
          data: {
            parentProductId: parentProduct.id,
            variantAttributes: attributes as any,
            listed: false, // Hide variants, show only parent
          },
        });

        totalVariants++;
        console.log(`    → Linked variant ${variant.sku} with attributes:`, attributes);
      }

      // Create ProductVariantOption entries for the parent
      for (const [optionName, values] of variantOptionsMap.entries()) {
        for (const optionValue of values) {
          await prisma.productVariantOption.create({
            data: {
              productId: parentProduct.id,
              optionName,
              optionValue,
              displayOrder: 0,
            },
          }).catch(() => {
            // Ignore duplicate errors
          });
          totalOptions++;
        }
      }

      console.log(`  ✓ Created variant options for ${countryCode}`);
    } catch (error) {
      console.error(`  ✗ Error processing ${countryCode}:`, error);
    }
  }

  console.log(`✓ Completed ${groupName}: ${totalParents} parents, ${totalVariants} variants, ${totalOptions} options`);
}

async function main() {
  try {
    console.log('=== Product Variant Data Migration ===\n');
    console.log('Note: This assumes schema changes have already been applied.\n');

    // Migrate each product group
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
