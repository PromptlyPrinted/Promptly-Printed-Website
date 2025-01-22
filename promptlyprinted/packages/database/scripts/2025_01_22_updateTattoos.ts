import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
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

const tattooGroups = {
  "Small Tattoos": [
    { sku: "TAT-SM-ROUND-2", price: "9.99", name: "2-inch Round Temporary Tattoo", description: "Small round temporary tattoo, perfect for simple designs and symbols." },
    { sku: "TAT-SM-SQUARE-2", price: "9.99", name: "2-inch Square Temporary Tattoo", description: "Small square temporary tattoo, ideal for geometric designs." },
    { sku: "TAT-SM-RECT-2X3", price: "11.99", name: "2x3-inch Rectangular Temporary Tattoo", description: "Small rectangular temporary tattoo, great for text and longer designs." },
    { sku: "TAT-SM-CUSTOM-2", price: "12.99", name: "2-inch Custom Shape Temporary Tattoo", description: "Small custom-shaped temporary tattoo for unique designs." }
  ],
  "Medium Tattoos": [
    { sku: "TAT-MD-ROUND-3", price: "14.99", name: "3-inch Round Temporary Tattoo", description: "Medium round temporary tattoo for detailed circular designs." },
    { sku: "TAT-MD-SQUARE-3", price: "14.99", name: "3-inch Square Temporary Tattoo", description: "Medium square temporary tattoo for larger geometric patterns." },
    { sku: "TAT-MD-RECT-3X4", price: "16.99", name: "3x4-inch Rectangular Temporary Tattoo", description: "Medium rectangular temporary tattoo for detailed artwork." },
    { sku: "TAT-MD-CUSTOM-3", price: "17.99", name: "3-inch Custom Shape Temporary Tattoo", description: "Medium custom-shaped temporary tattoo for complex designs." }
  ],
  "Large Tattoos": [
    { sku: "TAT-LG-ROUND-4", price: "19.99", name: "4-inch Round Temporary Tattoo", description: "Large round temporary tattoo for statement pieces." },
    { sku: "TAT-LG-SQUARE-4", price: "19.99", name: "4-inch Square Temporary Tattoo", description: "Large square temporary tattoo for bold designs." },
    { sku: "TAT-LG-RECT-4X6", price: "24.99", name: "4x6-inch Rectangular Temporary Tattoo", description: "Large rectangular temporary tattoo for full artwork pieces." },
    { sku: "TAT-LG-CUSTOM-4", price: "26.99", name: "4-inch Custom Shape Temporary Tattoo", description: "Large custom-shaped temporary tattoo for intricate designs." }
  ],
  "Tattoo Sets": [
    { sku: "TAT-SET-MINI-6", price: "29.99", name: "Mini Tattoo Set (6 pieces)", description: "Set of 6 mini temporary tattoos in various designs." },
    { sku: "TAT-SET-SM-4", price: "34.99", name: "Small Tattoo Set (4 pieces)", description: "Set of 4 small temporary tattoos with coordinated designs." },
    { sku: "TAT-SET-MD-3", price: "39.99", name: "Medium Tattoo Set (3 pieces)", description: "Set of 3 medium temporary tattoos that work together." },
    { sku: "TAT-SET-MIX-5", price: "44.99", name: "Mixed Size Tattoo Set (5 pieces)", description: "Set of 5 temporary tattoos in various sizes and designs." }
  ]
};

interface ProdigiProduct {
  sku: string;
  description: string;
  productDimensions: {
    width: number;
    height: number;
    units: string;
  };
  attributes: {
    brand?: string[];
    edge?: string[];
    color?: string[];
    gender?: string[];
    size?: string[];
    style?: string[];
    productType?: string[];
  };
  variants: Array<{
    attributes: {
      [key: string]: string;
    };
    shipsTo: string[];
  }>;
}

interface ProdigiResponse {
  outcome: string;
  product?: ProdigiProduct;
}

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

function convertPrice(priceUSD: number, exchangeRate: number): number {
  return Math.round(priceUSD * exchangeRate * 100) / 100;
}

async function getProdigiProduct(sku: string): Promise<ProdigiProduct | null> {
  try {
    await delay(1000); // Rate limiting

    const response = await fetch(`https://api.prodigi.com/v4.0/products/${sku}`, {
      headers: {
        'X-API-Key': process.env.PRODIGI_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 429) {
      console.warn(`Rate limit hit for SKU ${sku}, waiting 30s...`);
      await delay(30000);
      return getProdigiProduct(sku);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as ProdigiResponse;
    return data.product || null;
  } catch (error) {
    console.error(`Error fetching product ${sku}:`, error);
    return null;
  }
}

async function updateTattoo(
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
      const localPrice = convertPrice(priceUSD, exchangeRates[currency] || 1);

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
            productType: "TEMPORARY_TATTOO",
            listed: true,
            width: 0,
            height: 0,
            units: "IN",
            brand: "Custom Brand",
            edge: "Standard",
            color: ["Black"],
            gender: "Unisex",
            size: ["Standard"],
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
            productType: "TEMPORARY_TATTOO",
            listed: true,
            width: 0,
            height: 0,
            units: "IN",
            brand: "Custom Brand",
            edge: "Standard",
            color: ["Black"],
            gender: "Unisex",
            size: ["Standard"],
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
  console.log('Fetching exchange rates...');
  const exchangeRates = await getExchangeRates();

  for (const [groupName, products] of Object.entries(tattooGroups)) {
    console.log(`\nProcessing ${groupName}...`);
    
    for (const product of products) {
      await updateTattoo(groupName, product, exchangeRates);
    }
  }
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
