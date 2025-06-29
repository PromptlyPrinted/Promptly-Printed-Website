import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Top 20 countries for dropshipping apparel with their currency codes
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

const tshirtGroups = {
  "Men's T-shirts": [
    {
      sku: 'GLOBAL-TEE-GIL-64000',
      price: '69.99',
      name: 'Classic T-Shirt',
      description: "Men's classic fit t-shirt with premium cotton blend.",
    },
    {
      sku: 'AU3-TEE-U-B-3200',
      price: '69.99',
      name: 'Baseball Top',
      description: "Men's baseball style top (Australia only).",
    },
    {
      sku: 'AU3-TEE-M-B-3006',
      price: '69.99',
      name: 'Long Top',
      description: "Men's long style top (Australia only).",
    },
    {
      sku: 'GLOBAL-TEE-BC-3413',
      price: '71.99',
      name: 'Triblend T-Shirt',
      description: "Men's premium triblend t-shirt for ultimate comfort.",
    },
    {
      sku: 'TT-GIL-64200',
      price: '68.99',
      name: 'Tank Top',
      description: "Men's classic tank top for casual wear.",
    },
    {
      sku: 'GLOBAL-TEE-GIL-64V00',
      price: '69.99',
      name: 'V-Neck T-Shirt',
      description: "Men's v-neck t-shirt with modern fit.",
    },
    {
      sku: 'A-ML-GD2400',
      price: '71.99',
      name: 'Long Sleeve T-Shirt',
      description: "Men's long sleeve t-shirt for added coverage.",
    },
  ],
  "Women's T-shirts": [
    {
      sku: 'A-WT-GD64000L',
      price: '65.99',
      name: "Classic Women's T-Shirt",
      description: "Women's classic fit t-shirt with soft cotton blend.",
    },
    {
      sku: 'GLOBAL-TEE-BC-6035',
      price: '65.99',
      name: "V-Neck Women's T-Shirt",
      description: "Women's v-neck t-shirt with flattering fit.",
    },
  ],
  "Kids' T-shirts": [
    {
      sku: 'A-KT-GD64000B',
      price: '65.99',
      name: "Kids' T-Shirt",
      description: "Classic kids' t-shirt with durable construction.",
    },
    {
      sku: 'SWEAT-AWD-JH030B',
      price: '67.99',
      name: "Kids' Sweatshirt",
      description: "Classic kids' sweatshirt for everyday wear.",
    },
  ],
};

async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );
    const data = (await response.json()) as { rates: Record<string, number> };
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
}

function convertPrice(priceUSD: number, exchangeRate: number): number {
  return Math.round(priceUSD * exchangeRate * 100) / 100;
}

async function updateTshirt(
  sku: string,
  name: string,
  description: string,
  basePrice: number,
  exchangeRates: Record<string, number>
) {
  for (const country of SUPPORTED_COUNTRIES) {
    const exchangeRate = exchangeRates[country.currency] || 1;
    const localPrice = convertPrice(basePrice, exchangeRate);

    try {
      await prisma.product.upsert({
        where: {
          sku: sku,
        },
        update: {
          name,
          description,
          price: localPrice,
          currency: country.currency,
          shippingCost: 0,
          taxAmount: 0,
          totalCost: localPrice,
          customerPrice: localPrice,
          productType: 'T-SHIRT',
          listed: true,
          width: 24,
          height: 36,
          units: 'IN',
          brand: 'Custom Brand',
          edge: 'Standard',
          color: ['Black', 'White'],
          gender: 'Men',
          size: ['S', 'M', 'L', 'XL', '2XL'],
          style: 'Crew Neck',
          countryCode: country.code,
          category: {
            connect: {
              name: 'T-Shirts',
            },
          },
          updatedAt: new Date(),
        },
        create: {
          sku,
          name,
          description,
          price: localPrice,
          currency: country.currency,
          shippingCost: 0,
          taxAmount: 0,
          totalCost: localPrice,
          customerPrice: localPrice,
          productType: 'T-SHIRT',
          listed: true,
          width: 24,
          height: 36,
          units: 'IN',
          brand: 'Custom Brand',
          edge: 'Standard',
          color: ['Black', 'White'],
          gender: 'Men',
          size: ['S', 'M', 'L', 'XL', '2XL'],
          style: 'Crew Neck',
          countryCode: country.code,
          category: {
            connectOrCreate: {
              where: { name: 'T-Shirts' },
              create: { name: 'T-Shirts' },
            },
          },
        },
      });

      console.log(
        `Updated ${sku} for ${country.code} (${country.currency} ${localPrice})`
      );
    } catch (error) {
      console.error(`Error updating ${sku} for ${country.code}:`, error);
    }
  }
}

async function main() {
  console.log('Fetching exchange rates...');
  const exchangeRates = await getExchangeRates();

  for (const [groupName, group] of Object.entries(tshirtGroups)) {
    console.log(`\nProcessing ${groupName}...`);

    for (const product of group) {
      console.log(`Processing ${groupName} - ${product.sku}`);
      await updateTshirt(
        product.sku,
        product.name,
        product.description,
        Number.parseFloat(product.price),
        exchangeRates
      );
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
