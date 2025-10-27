import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const prisma = new PrismaClient();

const BASE_PATH = '/Users/nathangilbert/BusinessProjects/Promptly-Printed-Website/promptlyprinted/apps/web/public/assets/images/Apparel';

async function updateHoodieColors() {
  console.log('Updating hoodie colors to show all available options...\n');

  // Women's Hoodie
  const womensDir = path.join(BASE_PATH, 'Womens/Hoodies/A-WH-JH001F/Blanks/png');
  const womensColors = fs.readdirSync(womensDir)
    .filter(f => f.endsWith('.png') && !f.endsWith('.backup'))
    .filter(f => !fs.lstatSync(path.join(womensDir, f)).isSymbolicLink())
    .map(f => f.replace('.png', ''))
    .map(color => {
      // Convert filename to proper color name
      return color.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    });

  console.log(`Women's Hoodie - Found ${womensColors.length} colors`);

  await prisma.product.updateMany({
    where: { sku: 'A-WH-JH001F' },
    data: {
      color: womensColors,
      prodigiVariants: {
        colorOptions: womensColors.map(name => ({
          name,
          filename: `${name.toLowerCase().replace(/\s+/g, '-')}.png`
        })),
        imageUrls: {
          base: '/assets/images/Apparel/Womens/Hoodies/A-WH-JH001F/Blanks/png',
          productImage: '/assets/images/Apparel/Womens/Hoodies/A-WH-JH001F/ProductImage/image.png',
          cover: '/assets/images/Apparel/Womens/Hoodies/A-WH-JH001F/ProductImage/image.png',
        }
      }
    }
  });

  // Men's Hoodie
  const mensDir = path.join(BASE_PATH, 'Mens/Hoodies/A-MH-JH001/Blanks/png');
  const mensColors = fs.readdirSync(mensDir)
    .filter(f => f.endsWith('.png') && !f.endsWith('.backup'))
    .filter(f => !fs.lstatSync(path.join(mensDir, f)).isSymbolicLink())
    .map(f => f.replace('.png', ''))
    .map(color => {
      return color.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    });

  console.log(`Men's Hoodie - Found ${mensColors.length} colors`);

  await prisma.product.updateMany({
    where: { sku: 'A-MH-JH001' },
    data: {
      color: mensColors,
      prodigiVariants: {
        colorOptions: mensColors.map(name => ({
          name,
          filename: `${name.toLowerCase().replace(/\s+/g, '-')}.png`
        })),
        imageUrls: {
          base: '/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/Blanks/png',
          productImage: '/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/ProductImage/image.png',
          cover: '/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/ProductImage/image.png',
        }
      }
    }
  });

  // Kids Hoodie
  const kidsDir = path.join(BASE_PATH, 'Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/Blanks/png');
  const kidsColors = fs.readdirSync(kidsDir)
    .filter(f => f.endsWith('.png') && !f.endsWith('.backup'))
    .filter(f => !fs.lstatSync(path.join(kidsDir, f)).isSymbolicLink())
    .map(f => f.replace('.png', ''))
    .map(color => {
      return color.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    });

  console.log(`Kids Hoodie - Found ${kidsColors.length} colors`);

  await prisma.product.updateMany({
    where: { sku: 'HOOD-AWD-JH001B' },
    data: {
      color: kidsColors,
      prodigiVariants: {
        colorOptions: kidsColors.map(name => ({
          name,
          filename: `${name.toLowerCase().replace(/\s+/g, '-')}.png`
        })),
        imageUrls: {
          base: '/assets/images/Apparel/Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/Blanks/png',
          productImage: '/assets/images/Apparel/Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/ProductImage/image.png',
          cover: '/assets/images/Apparel/Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/ProductImage/image.png',
        }
      }
    }
  });

  console.log('\n✓ All hoodie colors updated in database!');
  console.log(`\nWomen's: ${womensColors.join(', ')}`);
  console.log(`\nMen's: ${mensColors.join(', ')}`);
  console.log(`\nKids: ${kidsColors.join(', ')}`);
}

async function main() {
  try {
    await updateHoodieColors();
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
