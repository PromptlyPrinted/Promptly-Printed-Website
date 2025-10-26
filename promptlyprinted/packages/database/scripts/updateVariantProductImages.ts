import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Update variant parent products with image paths
 */

const VARIANT_PRODUCT_IMAGES = {
  'PARENT-WATCH-BAND': {
    path: '/assets/images/Accessories/Apple-Watch-Band/ProductImage/image.png',
    name: 'Apple Watch Band',
  },
  'PARENT-STICKER': {
    path: '/assets/images/Stickers/Custom-Sticker/ProductImage/image.png',
    name: 'Custom Sticker',
  },
  'PARENT-LAPTOP-SLEEVE': {
    path: '/assets/images/Accessories/Laptop-Sleeve/ProductImage/image.png',
    name: 'Laptop Sleeve',
  },
  'PARENT-FLIPFLOP': {
    path: '/assets/images/Footwear/Flip-Flops/ProductImage/image.png',
    name: 'Flip-Flops',
  },
  'PARENT-PET-BED': {
    path: '/assets/images/Pets/Pet-Bed/ProductImage/image.png',
    name: 'Pet Bed',
  },
  'PARENT-PET-BANDANA': {
    path: '/assets/images/Pets/Pet-Bandana/ProductImage/image.png',
    name: 'Pet Bandana',
  },
  'PARENT-PET-TAG': {
    path: '/assets/images/Pets/Pet-Tag/ProductImage/image.png',
    name: 'Pet ID Tag',
  },
  'PARENT-NOTEBOOK': {
    path: '/assets/images/Stationery/Notebook/ProductImage/image.png',
    name: 'Notebook',
  },
  'PARENT-TATTOO': {
    path: '/assets/images/Temporary-Tattoos/Temporary-Tattoo/ProductImage/image.png',
    name: 'Temporary Tattoo',
  },
  'PARENT-PUZZLE': {
    path: '/assets/images/Games/Jigsaw-Puzzle/ProductImage/image.png',
    name: 'Jigsaw Puzzle',
  },
};

async function updateVariantProductImages() {
  console.log('Updating variant product images...\n');

  for (const [sku, imageInfo] of Object.entries(VARIANT_PRODUCT_IMAGES)) {
    try {
      // Update all countries for this SKU
      const result = await prisma.product.updateMany({
        where: {
          sku: sku,
          isVariantProduct: true,
        },
        data: {
          prodigiVariants: {
            imageUrls: {
              productImage: imageInfo.path,
              cover: imageInfo.path,
              base: imageInfo.path.replace('/ProductImage/image.png', ''),
            },
          },
        },
      });

      console.log(`✓ Updated ${result.count} products for ${imageInfo.name} (${sku})`);
      console.log(`  Image path: ${imageInfo.path}`);
    } catch (error) {
      console.error(`✗ Error updating ${imageInfo.name}:`, error);
    }
  }

  console.log('\n=== Image paths updated ===');
  console.log('\nNext steps:');
  console.log('1. Add image.png files to each ProductImage directory');
  console.log('2. Images should be product hero shots');
  console.log('3. Check README.md in each directory for details');
}

async function main() {
  try {
    await updateVariantProductImages();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
