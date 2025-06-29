import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

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

const accessoryGroups = {
  Bags: [
    {
      sku: 'H-BAG-LTOTE',
      price: '29.99',
      name: 'Large Tote Bag',
      description: 'Spacious tote bag with custom design.',
    },
  ],
  'Gaming Accessories': [
    {
      sku: 'GLOBAL-GAMINGMAT',
      price: '49.99',
      name: 'Gaming Mouse Pad',
      description: 'Large format gaming mouse pad for precision control.',
    },
    {
      sku: 'GLOBAL-MOUSEMAT',
      price: '19.99',
      name: 'Mouse Pad',
      description: 'Standard size mouse pad with custom design.',
    },
  ],
  'Laptop Accessories': [
    {
      sku: 'LAPTOP-SLEEVE-12IN',
      price: '49.99',
      name: '12" Laptop Sleeve',
      description: 'Protective sleeve for 12-inch laptops (US Only).',
    },
    {
      sku: 'LAPTOP-SLEEVE-13IN',
      price: '51.99',
      name: '13" Laptop Sleeve',
      description: 'Protective sleeve for 13-inch laptops (US Only).',
    },
    {
      sku: 'LAPTOP-SLEEVE-15IN',
      price: '53.99',
      name: '15" Laptop Sleeve',
      description: 'Protective sleeve for 15-inch laptops (US Only).',
    },
  ],
  'Jewelry & Keychains': [
    {
      sku: 'PEND-ROUND',
      price: '13.99',
      name: 'Round Pendant',
      description: 'Custom round pendant with your design.',
    },
    {
      sku: 'PEND-SQUARE',
      price: '13.99',
      name: 'Square Pendant',
      description: 'Custom square pendant with your design.',
    },
    {
      sku: 'PLA-KEYRING',
      price: '14.99',
      name: 'Plastic Keyring',
      description: 'Durable plastic keyring with custom design.',
    },
    {
      sku: 'M-KEY-5X3_5',
      price: '13.99',
      name: 'Metal Keyring',
      description: 'Premium metal keyring with custom design.',
    },
  ],
  'Apple Watch Bands': [
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-RG-38MM',
      price: '59.99',
      name: '38mm Rose Gold Band',
      description: 'Apple Watch band 38mm in rose gold finish.',
    },
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-42MM',
      price: '61.99',
      name: '42mm Standard Band',
      description: 'Apple Watch band 42mm in standard finish.',
    },
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-38MM',
      price: '59.99',
      name: '38mm Standard Band',
      description: 'Apple Watch band 38mm in standard finish.',
    },
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-G-42MM',
      price: '61.99',
      name: '42mm Gold Band',
      description: 'Apple Watch band 42mm in gold finish.',
    },
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-RG-42MM',
      price: '61.99',
      name: '42mm Rose Gold Band',
      description: 'Apple Watch band 42mm in rose gold finish.',
    },
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-G-38MM',
      price: '59.99',
      name: '38mm Gold Band',
      description: 'Apple Watch band 38mm in gold finish.',
    },
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-S-38MM',
      price: '59.99',
      name: '38mm Silver Band',
      description: 'Apple Watch band 38mm in silver finish.',
    },
    {
      sku: 'GLOBAL-TECH-AP-WS-FL-S-42MM',
      price: '61.99',
      name: '42mm Silver Band',
      description: 'Apple Watch band 42mm in silver finish.',
    },
  ],
  Stickers: [
    {
      sku: 'GLOBAL-STI-3X4-G',
      price: '6.99',
      name: '3x4" Glossy Sticker',
      description: '3x4 inch sticker with glossy finish.',
    },
    {
      sku: 'GLOBAL-STI-3X4-M',
      price: '6.99',
      name: '3x4" Matte Sticker',
      description: '3x4 inch sticker with matte finish.',
    },
    {
      sku: 'GLOBAL-STI-5_5X5_5-G',
      price: '9.99',
      name: '6x6" Glossy Sticker',
      description: '6x6 inch sticker with glossy finish.',
    },
    {
      sku: 'GLOBAL-STI-5_5X5_5-M',
      price: '9.99',
      name: '6x6" Matte Sticker',
      description: '6x6 inch sticker with matte finish.',
    },
  ],
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    const data = (await response.json()) as ExchangeRateResponse;
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
}

async function convertPrice(
  priceUSD: number,
  targetCurrency: string,
  rates: Record<string, number>
): Promise<number> {
  if (targetCurrency === 'USD') return priceUSD;

  const rate = rates[targetCurrency];
  if (!rate) {
    console.warn(
      `No exchange rate found for ${targetCurrency}, using USD price`
    );
    return priceUSD;
  }

  const converted = priceUSD * rate;

  // Round to 2 decimal places for most currencies, except JPY and KRW
  if (targetCurrency === 'JPY' || targetCurrency === 'KRW') {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

async function updateAccessory(
  groupName: string,
  {
    sku,
    price,
    name,
    description,
  }: { sku: string; price: string; name: string; description: string },
  exchangeRates: Record<string, number>
) {
  try {
    console.log(`Processing ${groupName} - ${sku}`);

    const priceUSD = Number.parseFloat(price);

    // For each supported country
    for (const country of SUPPORTED_COUNTRIES) {
      const { code: countryCode, currency } = country;

      // Skip non-US countries for US-only products
      if (sku.startsWith('LAPTOP-SLEEVE-') && countryCode !== 'US') {
        console.log(`Skipping ${sku} for ${countryCode} - US only product`);
        continue;
      }

      // Convert price to local currency
      const localPrice = await convertPrice(priceUSD, currency, exchangeRates);

      // Determine product type based on group name and SKU
      let productType = 'ACCESSORY';
      if (sku.includes('GAMINGMAT') || sku.includes('MOUSEMAT')) {
        productType = 'MOUSE_PAD';
      } else if (sku.includes('LAPTOP-SLEEVE')) {
        productType = 'LAPTOP_SLEEVE';
      } else if (sku.includes('PEND')) {
        productType = 'PENDANT';
      } else if (sku.includes('KEY')) {
        productType = 'KEYRING';
      } else if (sku.includes('AP-WS')) {
        productType = 'WATCH_BAND';
      } else if (sku.includes('STI')) {
        productType = 'STICKER';
      }

      try {
        await prisma.product.upsert({
          where: {
            sku: `${sku}-${countryCode}`,
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
            units: 'IN',
            brand: 'Custom Brand',
            edge: 'Standard',
            color: ['Black'],
            gender: 'Unisex',
            size: ['Standard'],
            style: 'Standard',
            countryCode,
            category: {
              connectOrCreate: {
                where: { name: groupName },
                create: { name: groupName },
              },
            },
            updatedAt: new Date(),
          },
          create: {
            sku: `${sku}-${countryCode}`,
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
            units: 'IN',
            brand: 'Custom Brand',
            edge: 'Standard',
            color: ['Black'],
            gender: 'Unisex',
            size: ['Standard'],
            style: 'Standard',
            countryCode,
            category: {
              connectOrCreate: {
                where: { name: groupName },
                create: { name: groupName },
              },
            },
          },
        });

        console.log(
          `Updated ${sku} for ${countryCode} (${currency} ${localPrice})`
        );
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

    for (const [groupName, products] of Object.entries(accessoryGroups)) {
      console.log(`\nProcessing ${groupName}...`);
      for (const product of products) {
        await updateAccessory(groupName, product, exchangeRates);
      }
    }
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
