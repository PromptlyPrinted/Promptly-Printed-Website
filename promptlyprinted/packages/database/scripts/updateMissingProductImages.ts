import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Update products with missing images
 */

const PRODUCT_IMAGES: Record<string, string> = {
  // Pendants
  'PEND-ROUND': '/assets/images/Accessories/Pendants/ProductImage/round-pendant.png',
  'PEND-SQUARE': '/assets/images/Accessories/Pendants/ProductImage/square-pendant.png',

  // Keyrings
  'PLA-KEYRING': '/assets/images/Accessories/Keyrings/ProductImage/plastic-keyring.png',
  'M-KEY-5X3_5': '/assets/images/Accessories/Keyrings/ProductImage/metal-keyring.png',

  // Bags
  'H-BAG-LTOTE': '/assets/images/Bags/Tote-Bag/ProductImage/image.png',

  // Mouse Pads
  'GLOBAL-GAMINGMAT': '/assets/images/Accessories/Mouse-Pads/ProductImage/gaming-mousepad.png',
  'GLOBAL-MOUSEMAT': '/assets/images/Accessories/Mouse-Pads/ProductImage/mousepad.png',

  // Books
  'BOOK-FE-A4-P-SOFT-S': '/assets/images/Books/ProductImage/a4-portrait-soft.png',
  'BOOK-FE-8_3-SQ-SOFT-S': '/assets/images/Books/ProductImage/8-3-square-soft.png',
  'BOOK-FE-A5-L-SOFT-S': '/assets/images/Books/ProductImage/a5-landscape-soft.png',
  'BOOK-FE-A5-P-SOFT-S': '/assets/images/Books/ProductImage/a5-portrait-soft.png',
  'BOOK-FE-A5-P-HARD-G': '/assets/images/Books/ProductImage/a5-portrait-hard.png',
  'BOOK-FE-A4-L-SOFT-S': '/assets/images/Books/ProductImage/a4-landscape-soft.png',

  // Socks
  'GLOBAL-ANKLE-SOCKS': '/assets/images/Apparel/Socks/ProductImage/ankle-socks.png',
  'GLOBAL-TUBE-SOCKS': '/assets/images/Apparel/Socks/ProductImage/tube-socks.png',

  // Cutting Boards
  'H-CUTTINGBOARD-GLASS-CIRC': '/assets/images/Home-Living/Cutting-Boards/ProductImage/circular-glass.png',
  'H-CUTTINGBOARD-GLASS': '/assets/images/Home-Living/Cutting-Boards/ProductImage/rectangular-glass.png',

  // Metal Tins
  'MET-TIN-ROU': '/assets/images/Home-Living/Metal-Tins/ProductImage/round-tin.png',
  'MET-TIN-REC': '/assets/images/Home-Living/Metal-Tins/ProductImage/rectangle-tin.png',

  // Art Prints
  'GLOBAL-MINI-11X14': '/assets/images/Art-Prints/ProductImage/image.png',

  // Coasters
  'H-COAST-2PK': '/assets/images/Home-Living/Coasters/ProductImage/image.png',

  // Postcards
  'GLOBAL-POST-MOH-6X4': '/assets/images/Stationery/Postcards/ProductImage/image.png',

  // Mugs
  'GLOBAL-MUG-W': '/assets/images/Home-Living/Mugs/ProductImage/ceramic-mug.png',
  'H-MUG-METAL-16OZ-B': '/assets/images/Home-Living/Mugs/ProductImage/metal-travel-mug.png',

  // Plant Pots
  'PLANT-POT': '/assets/images/Home-Living/Plant-Pots/ProductImage/image.png',

  // Playing Cards
  'PLAY-CARD': '/assets/images/Games/Playing-Cards/ProductImage/image.png',
};

async function updateProductImages() {
  console.log('Updating product images...\n');

  let totalUpdated = 0;

  for (const [sku, imagePath] of Object.entries(PRODUCT_IMAGES)) {
    try {
      const result = await prisma.product.updateMany({
        where: {
          sku: sku,
        },
        data: {
          prodigiVariants: {
            imageUrls: {
              productImage: imagePath,
              cover: imagePath,
              base: imagePath.replace('/ProductImage/', '/').replace(/\/[^/]+\.png$/, ''),
            },
          },
        },
      });

      if (result.count > 0) {
        console.log(`✓ Updated ${result.count} products for SKU: ${sku}`);
        totalUpdated += result.count;
      }
    } catch (error) {
      console.error(`✗ Error updating ${sku}:`, error);
    }
  }

  console.log(`\n=== Total: ${totalUpdated} products updated ===`);
}

async function main() {
  try {
    await updateProductImages();
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
