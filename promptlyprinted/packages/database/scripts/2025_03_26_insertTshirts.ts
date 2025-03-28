import { PrismaClient } from '@prisma/client';
import { tshirtDetails } from './2025_03_26_updateTshirtDetails.js';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  try {
    // First, ensure all required categories exist
    const categories = [
      "Men's T-shirts",
      "Women's T-shirts",
      "Baby Clothing",
      "Kids' T-shirts",
      "Kids' Sweatshirts"
    ];

    for (const categoryName of categories) {
      await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          description: `Category for ${categoryName}`
        }
      });
    }

    // Get all categories for reference
    const categoryMap = await prisma.category.findMany();
    const categoryIdMap = new Map(categoryMap.map(cat => [cat.name, cat.id]));

    // Insert all t-shirts
    for (const [sku, details] of Object.entries(tshirtDetails)) {
      const categoryId = categoryIdMap.get(details.category);
      if (!categoryId) {
        console.error(`Category not found for ${details.category}`);
        continue;
      }

      // Create base product
      const product = await prisma.product.upsert({
        where: { 
          sku_countryCode: {
            sku: sku,
            countryCode: 'US' // Default to US for now
          }
        },
        update: {
          name: details.name,
          description: details.shortDescription,
          price: details.pricing[0].amount, // Use USD price as base
          customerPrice: details.pricing[0].amount,
          currency: details.pricing[0].currency,
          categoryId: categoryId,
          productType: details.productType,
          brand: details.brand.name,
          color: details.colorOptions.map(opt => opt.name),
          countryCode: 'US',
          gender: details.category.includes("Men's") ? 'M' : 
                  details.category.includes("Women's") ? 'F' : 'U',
          height: details.dimensions.height,
          width: details.dimensions.width,
          units: details.dimensions.units,
          size: details.size,
          shippingCost: 0, // Will be calculated based on shipping zones
          taxAmount: 0, // Will be calculated based on region
          totalCost: details.pricing[0].amount,
          edge: 'standard', // Default value
          style: 'casual', // Default value
          prodigiAttributes: {
            features: details.features,
            materials: details.materials,
            ecoProperties: details.ecoProperties,
            careInstructions: details.careInstructions,
            manufacturingLocation: details.manufacturingLocation
          },
          prodigiDescription: details.shortDescription,
          prodigiVariants: {
            colorOptions: details.colorOptions,
            shippingZones: details.shippingZones,
            customsDutyInfo: details.customsDutyInfo,
            restrictions: details.restrictions
          }
        },
        create: {
          name: details.name,
          sku: sku,
          description: details.shortDescription,
          price: details.pricing[0].amount,
          customerPrice: details.pricing[0].amount,
          currency: details.pricing[0].currency,
          categoryId: categoryId,
          productType: details.productType,
          brand: details.brand.name,
          color: details.colorOptions.map(opt => opt.name),
          countryCode: 'US',
          gender: details.category.includes("Men's") ? 'M' : 
                  details.category.includes("Women's") ? 'F' : 'U',
          height: details.dimensions.height,
          width: details.dimensions.width,
          units: details.dimensions.units,
          size: details.size,
          shippingCost: 0,
          taxAmount: 0,
          totalCost: details.pricing[0].amount,
          edge: 'standard', // Default value
          style: 'casual', // Default value
          prodigiAttributes: {
            features: details.features,
            materials: details.materials,
            ecoProperties: details.ecoProperties,
            careInstructions: details.careInstructions,
            manufacturingLocation: details.manufacturingLocation
          },
          prodigiDescription: details.shortDescription,
          prodigiVariants: {
            colorOptions: details.colorOptions,
            shippingZones: details.shippingZones,
            customsDutyInfo: details.customsDutyInfo,
            restrictions: details.restrictions
          }
        }
      });

      // Create images for the product
      if (details.imageUrls.base) {
        await prisma.image.create({
          data: {
            url: details.imageUrls.base,
            productId: product.id
          }
        });
      }

      // Create additional images if they exist
      const additionalImages = [
        { url: details.imageUrls.front, type: 'front' },
        { url: details.imageUrls.back, type: 'back' },
        { url: details.imageUrls.closeup, type: 'closeup' },
        { url: details.imageUrls.lifestyle, type: 'lifestyle' }
      ].filter((img): img is { url: string; type: string } => 
        typeof img.url === 'string'
      );

      for (const img of additionalImages) {
        await prisma.image.create({
          data: {
            url: img.url,
            productId: product.id
          }
        });
      }

      console.log(`Created/Updated product: ${sku}`);
    }

    console.log('Successfully inserted all t-shirt data');
  } catch (error) {
    console.error('Error inserting t-shirt data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 