import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const SUPPORTED_COUNTRIES = [
  { code: 'US', currency: 'USD' },
  { code: 'GB', currency: 'GBP' },
  { code: 'DE', currency: 'EUR' },
  { code: 'AU', currency: 'AUD' },
  { code: 'FR', currency: 'EUR' },
  { code: 'CH', currency: 'CHF' },
  { code: 'SE', currency: 'SEK' },
  { code: 'AE', currency: 'AED' },
  { code: 'ES', currency: 'EUR' },
  { code: 'IT', currency: 'EUR' },
  { code: 'NL', currency: 'EUR' },
  { code: 'DK', currency: 'DKK' },
  { code: 'NO', currency: 'NOK' },
  { code: 'NZ', currency: 'NZD' },
  { code: 'IE', currency: 'EUR' },
  { code: 'KR', currency: 'KRW' },
  { code: 'JP', currency: 'JPY' },
  { code: 'BE', currency: 'EUR' },
  { code: 'SG', currency: 'SGD' },
  { code: 'CN', currency: 'CNY' },
];

const petGroups = {
  "Pet Beds": [
    { sku: "H-PET-SMALL-PB", price: "49.99", name: "Pet Bed Small", description: "Cozy bed for small pets with custom printed design." },
    { sku: "H-PET-MEDIUM-PB", price: "69.99", name: "Pet Bed Medium", description: "Comfortable bed for medium pets with custom printed design." },
    { sku: "H-PET-LARGE-PB", price: "79.99", name: "Pet Bed Large", description: "Spacious bed for large pets with custom printed design." }
  ],
  "Pet Accessories": [
    { sku: "PET-BANDANA-SML", price: "22.99", name: "Pet Bandana Small", description: "Stylish bandana for small pets, adjustable fit." },
    { sku: "PET-BANDANA-MED", price: "23.99", name: "Pet Bandana Medium", description: "Stylish bandana for medium pets, adjustable fit." },
    { sku: "PET-BANDANA-LRG", price: "24.99", name: "Pet Bandana Large", description: "Stylish bandana for large pets, adjustable fit." },
    { sku: "PET-MET-BONE", price: "13.99", name: "Pet Tag - Bone", description: "Custom pet ID tag in bone shape." },
    { sku: "PET-MET-ROUND", price: "13.99", name: "Pet Tag - Round", description: "Custom pet ID tag in round shape." }
  ]
};

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json() as ExchangeRateResponse;
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
}

async function convertPrice(priceUSD: number, targetCurrency: string, rates: Record<string, number>): Promise<number> {
  if (targetCurrency === 'USD') return priceUSD;
  
  const rate = rates[targetCurrency];
  if (!rate) {
    console.warn(`No exchange rate found for ${targetCurrency}, using USD price`);
    return priceUSD;
  }

  const converted = priceUSD * rate;
  
  // Round to 2 decimal places for most currencies, except JPY and KRW
  if (targetCurrency === 'JPY' || targetCurrency === 'KRW') {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

async function updatePet(
  groupName: string,
  { sku, price, name, description }: { sku: string; price: string; name: string; description: string },
  exchangeRates: Record<string, number>
) {
  try {
    console.log(`Processing ${groupName} - ${sku}`);

    const priceUSD = parseFloat(price);

    // For each supported country
    for (const country of SUPPORTED_COUNTRIES) {
      const { code: countryCode, currency } = country;

      // Convert price to local currency
      const localPrice = await convertPrice(priceUSD, currency, exchangeRates);

      // Determine product type based on group name and SKU
      let productType = 'PET_APPAREL';
      if (sku.includes('BED') || sku.includes('MAT')) {
        productType = 'PET_BED';
      } else if (sku.includes('BAND') || sku.includes('BOW') || sku.includes('CAP') || sku.includes('SCARF')) {
        productType = 'PET_ACCESSORY';
      }

      try {
        await prisma.product.upsert({
          where: {
            sku: sku
          },
          update: {
            name,
            description,
            price: localPrice,
            currency,
            shippingCost: 0,
            taxAmount: 0,
            totalCost: localPrice,
            customerPrice: localPrice,
            productType,
            listed: true,
            width: 0,
            height: 0,
            units: "IN",
            brand: "Custom Brand",
            edge: "Standard",
            color: ["Multi"],
            gender: "Unisex",
            size: [sku.includes('SM') ? 'Small' : sku.includes('MD') ? 'Medium' : sku.includes('LG') ? 'Large' : 'One Size'],
            style: "Standard",
            countryCode,
            category: {
              connectOrCreate: {
                where: { name: groupName },
                create: { name: groupName }
              }
            },
            updatedAt: new Date()
          },
          create: {
            sku,
            name,
            description,
            price: localPrice,
            currency,
            shippingCost: 0,
            taxAmount: 0,
            totalCost: localPrice,
            customerPrice: localPrice,
            productType,
            listed: true,
            width: 0,
            height: 0,
            units: "IN",
            brand: "Custom Brand",
            edge: "Standard",
            color: ["Multi"],
            gender: "Unisex",
            size: [sku.includes('SM') ? 'Small' : sku.includes('MD') ? 'Medium' : sku.includes('LG') ? 'Large' : 'One Size'],
            style: "Standard",
            countryCode,
            category: {
              connectOrCreate: {
                where: { name: groupName },
                create: { name: groupName }
              }
            }
          }
        });

        console.log(`Updated ${sku} for ${countryCode} (${currency} ${localPrice})`);
      } catch (error) {
        console.error(`Error updating ${sku} for ${countryCode}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error processing ${sku}:`, error);
  }
}

async function main() {
  try {
    console.log('Fetching exchange rates...');
    const exchangeRates = await getExchangeRates();
    if (Object.keys(exchangeRates).length === 0) {
      throw new Error('Failed to fetch exchange rates');
    }

    for (const [groupName, products] of Object.entries(petGroups)) {
      console.log(`\nProcessing ${groupName}...`);
      for (const product of products) {
        await updatePet(groupName, product, exchangeRates);
      }
    }
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 