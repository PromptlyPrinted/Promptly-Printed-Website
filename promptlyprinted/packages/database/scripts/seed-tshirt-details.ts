import { PrismaClient } from '@prisma/client';
import { tshirtDetails } from './tshirt-details.ts';

const prisma = new PrismaClient();

// List of supported countries and their currency codes
const countryCurrencyMap = [
  { countryCode: 'US', currency: 'USD' },
  { countryCode: 'GB', currency: 'GBP' },
  { countryCode: 'DE', currency: 'EUR' },
  { countryCode: 'FR', currency: 'EUR' },
  { countryCode: 'IT', currency: 'EUR' },
  { countryCode: 'ES', currency: 'EUR' },
  { countryCode: 'NL', currency: 'EUR' },
  { countryCode: 'BE', currency: 'EUR' },
  { countryCode: 'IE', currency: 'EUR' },
  { countryCode: 'AT', currency: 'EUR' },
  { countryCode: 'PT', currency: 'EUR' },
  { countryCode: 'FI', currency: 'EUR' },
  { countryCode: 'GR', currency: 'EUR' },
  { countryCode: 'AU', currency: 'AUD' },
  { countryCode: 'CH', currency: 'CHF' },
  { countryCode: 'SE', currency: 'SEK' },
  { countryCode: 'AE', currency: 'AED' },
  { countryCode: 'DK', currency: 'DKK' },
  { countryCode: 'NO', currency: 'NOK' },
  { countryCode: 'NZ', currency: 'NZD' },
  { countryCode: 'KR', currency: 'KRW' },
  { countryCode: 'JP', currency: 'JPY' },
  { countryCode: 'SG', currency: 'SGD' },
  { countryCode: 'CN', currency: 'CNY' },
];

type Pricing = { amount: number; currency: string };

function getPriceForCurrency(pricingArr: Pricing[], currency: string): number {
  // Find the price object for the given currency
  return (
    pricingArr.find((p: Pricing) => p.currency === currency)?.amount ??
    pricingArr[0]?.amount ??
    0
  );
}

async function main() {
  for (const [sku, details] of Object.entries(tshirtDetails)) {
    for (const { countryCode, currency } of countryCurrencyMap) {
      try {
        const price = getPriceForCurrency(details.pricing, currency);
        await prisma.product.upsert({
          where: { sku_countryCode: { sku, countryCode } },
          update: {
            name: details.name,
            description: details.shortDescription,
            price: price,
            customerPrice: price,
            currency: currency,
            categoryId: null, // Set your category logic if needed
            productType: details.productType,
            brand: details.brand.name,
            color: details.colorOptions.map(
              (opt: { name: string }) => opt.name
            ),
            countryCode: countryCode,
            gender: details.category.includes("Men's")
              ? 'M'
              : details.category.includes("Women's")
                ? 'F'
                : 'U',
            height: details.dimensions.height,
            width: details.dimensions.width,
            units: details.dimensions.units,
            size: details.size,
            shippingCost: 0,
            taxAmount: 0,
            totalCost: price,
            edge: 'standard',
            style: 'casual',
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
            price: price,
            customerPrice: price,
            currency: currency,
            categoryId: null, // Set your category logic if needed
            productType: details.productType,
            brand: details.brand.name,
            color: details.colorOptions.map(
              (opt: { name: string }) => opt.name
            ),
            countryCode: countryCode,
            gender: details.category.includes("Men's")
              ? 'M'
              : details.category.includes("Women's")
                ? 'F'
                : 'U',
            height: details.dimensions.height,
            width: details.dimensions.width,
            units: details.dimensions.units,
            size: details.size,
            shippingCost: 0,
            taxAmount: 0,
            totalCost: price,
            edge: 'standard',
            style: 'casual',
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
        console.log(`Upserted product: ${sku} for country: ${countryCode}`);
      } catch (err) {
        console.error(
          `Error inserting SKU ${sku} for country ${countryCode}:`,
          err
        );
      }
    }
  }
  await prisma.$disconnect();
}

main();
