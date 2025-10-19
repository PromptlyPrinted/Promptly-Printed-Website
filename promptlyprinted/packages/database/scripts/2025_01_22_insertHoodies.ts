import { PrismaClient } from '@prisma/client';
import { hoodieDetails } from './2025_01_22_updateHoodies.js';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Define all shipping zones and countries
const shippingZones = {
  EU: {
    countries: [
      'DE',
      'FR',
      'IT',
      'ES',
      'NL',
      'BE',
      'IE',
      'AT',
      'PT',
      'FI',
      'GR',
    ],
    currency: 'EUR',
  },
  UK: {
    countries: ['GB'],
    currency: 'GBP',
  },
  US: {
    countries: ['US'],
    currency: 'USD',
  },
  APAC: {
    countries: ['AU', 'NZ', 'JP', 'KR', 'SG'],
    currency: 'USD', // You may want to customize this per country if needed
  },
  ROW: {
    countries: ['CH', 'SE', 'AE', 'DK', 'NO', 'CN'],
    currency: 'USD', // You may want to customize this per country if needed
  },
};

// Build a map of countryCode -> currency
const countryCurrencyMap: Record<string, string> = {};
for (const zone of Object.values(shippingZones)) {
  for (const country of zone.countries) {
    countryCurrencyMap[country] = zone.currency;
  }
}

async function main() {
  try {
    // First, ensure all required categories exist
    const categories = ["Men's Hoodies", "Women's Hoodies", 'Kids Hoodies'];

    for (const categoryName of categories) {
      await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          description: `Category for ${categoryName}`,
        },
      });
    }

    // Get all categories for reference
    const categoryMap = await prisma.category.findMany();
    const categoryIdMap = new Map(categoryMap.map((cat) => [cat.name, cat.id]));

    // Insert all hoodies
    for (const [sku, details] of Object.entries(hoodieDetails)) {
      const categoryId = categoryIdMap.get(details.category);
      if (!categoryId) {
        console.error(`Category not found for ${details.category}`);
        continue;
      }

      // --- Loop over all supported countries ---
      for (const countryCode of Object.keys(countryCurrencyMap)) {
        // Find the preferred currency for this country
        const currency = countryCurrencyMap[countryCode];
        // Find the price in that currency, fallback to USD if not found
        const priceObj =
          details.pricing.find((p) => p.currency === currency) ||
          details.pricing[0];

        // Create base product
        const product = await prisma.product.upsert({
          where: {
            sku_countryCode: {
              sku: sku,
              countryCode: countryCode,
            },
          },
          update: {
            name: details.name,
            description: details.shortDescription,
            price: priceObj.amount,
            customerPrice: priceObj.amount,
            currency: priceObj.currency,
            categoryId: categoryId,
            productType: details.productType,
            brand: details.brand.name,
            color: details.colorOptions.map((opt) => opt.name),
            countryCode: countryCode,
            gender: details.category.includes("Men's")
              ? 'M'
              : details.category.includes("Women's")
                ? 'F'
                : details.category.includes('Kids')
                  ? 'U'
                  : 'U',
            height: details.dimensions.height,
            width: details.dimensions.width,
            units: details.dimensions.units,
            size: details.size,
            shippingCost: 0, // Will be calculated based on shipping zones
            taxAmount: 0, // Will be calculated based on region
            totalCost: priceObj.amount,
            edge: 'standard', // Default value
            style: 'casual', // Default value
            prodigiAttributes: {
              features: details.features,
              materials: details.materials,
              ecoProperties: details.ecoProperties,
              careInstructions: details.careInstructions,
              manufacturingLocation: details.manufacturingLocation,
            },
            prodigiDescription: details.shortDescription,
            prodigiVariants: {
              colorOptions: details.colorOptions,
              shippingZones: details.shippingZones,
              customsDutyInfo: details.customsDutyInfo,
              restrictions: details.restrictions,
              imageUrls: details.imageUrls,
            },
          },
          create: {
            name: details.name,
            sku: sku,
            description: details.shortDescription,
            price: priceObj.amount,
            customerPrice: priceObj.amount,
            currency: priceObj.currency,
            categoryId: categoryId,
            productType: details.productType,
            brand: details.brand.name,
            color: details.colorOptions.map((opt) => opt.name),
            countryCode: countryCode,
            gender: details.category.includes("Men's")
              ? 'M'
              : details.category.includes("Women's")
                ? 'F'
                : details.category.includes('Kids')
                  ? 'U'
                  : 'U',
            height: details.dimensions.height,
            width: details.dimensions.width,
            units: details.dimensions.units,
            size: details.size,
            shippingCost: 0, // Will be calculated based on shipping zones
            taxAmount: 0, // Will be calculated based on region
            totalCost: priceObj.amount,
            edge: 'standard', // Default value
            style: 'casual', // Default value
            prodigiAttributes: {
              features: details.features,
              materials: details.materials,
              ecoProperties: details.ecoProperties,
              careInstructions: details.careInstructions,
              manufacturingLocation: details.manufacturingLocation,
            },
            prodigiDescription: details.shortDescription,
            prodigiVariants: {
              colorOptions: details.colorOptions,
              shippingZones: details.shippingZones,
              customsDutyInfo: details.customsDutyInfo,
              restrictions: details.restrictions,
              imageUrls: details.imageUrls,
            },
          },
        });
        console.log(
          `Created/Updated product: ${sku} for country: ${countryCode}`
        );
      }
      // --- End country loop ---
    }

    console.log('Successfully inserted all hoodie data');
  } catch (error) {
    console.error('Error inserting hoodie data:', error);
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
