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

const bookGroups = {
  Books: [
    {
      sku: 'BOOK-FE-A5-P-HARD-G',
      price: '29.99',
      name: 'A5 Portrait Hardcover',
      description: 'Premium hardcover book with glossy finish.',
    },
    {
      sku: 'BOOK-FE-A4-L-SOFT-S',
      price: '29.99',
      name: 'A4 Landscape Softcover',
      description: '12x9" softcover book with silk finish, 72h production.',
    },
    {
      sku: 'BOOK-FE-A4-P-SOFT-S',
      price: '29.99',
      name: 'A4 Portrait Softcover',
      description: '9x12" softcover book with silk finish, 72h production.',
    },
    {
      sku: 'BOOK-FE-8_3-SQ-SOFT-S',
      price: '24.99',
      name: '8.3" Square Softcover',
      description: '9x9" softcover book with silk finish, 72h production.',
    },
    {
      sku: 'BOOK-FE-A5-L-SOFT-S',
      price: '20.99',
      name: 'A5 Landscape Softcover',
      description: '9x6" softcover book with silk finish, 72h production.',
    },
    {
      sku: 'BOOK-FE-A5-P-SOFT-S',
      price: '20.99',
      name: 'A5 Portrait Softcover',
      description: '6x9" softcover book with silk finish, 72h production.',
    },
  ],
  Notebooks: [
    {
      sku: 'NB-GRAPH',
      price: '19.99',
      name: '6x9" Graph Notebook',
      description: 'Graph paper notebook, 48h production.',
    },
    {
      sku: 'NB-LINED',
      price: '19.99',
      name: '6x9" Lined Notebook',
      description: 'Lined paper notebook, 48h production.',
    },
    {
      sku: 'NB-GRAPH-A4',
      price: '25.99',
      name: '9x12" Graph Notebook',
      description: 'A4 graph paper notebook, 48h production.',
    },
    {
      sku: 'NB-LINED-A4',
      price: '25.99',
      name: '9x12" Lined Notebook',
      description: 'A4 lined paper notebook, 48h production.',
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

async function getProdigiProduct(sku: string): Promise<ProdigiProduct | null> {
  try {
    await delay(1000); // Rate limiting

    const response = await fetch(
      `https://api.prodigi.com/v4.0/products/${sku}`,
      {
        headers: {
          'X-API-Key': process.env.PRODIGI_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 429) {
      console.warn(`Rate limit hit for SKU ${sku}, waiting 30s...`);
      await delay(30000);
      return getProdigiProduct(sku);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = (await response.json()) as ProdigiResponse;
    return data.product || null;
  } catch (error) {
    console.error(`Error fetching product ${sku}:`, error);
    return null;
  }
}

async function updateBook(
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

      // Convert price to local currency
      const localPrice = await convertPrice(priceUSD, currency, exchangeRates);

      // Determine product type based on group name and SKU
      let productType = 'BOOK';
      let subcategory = groupName.toUpperCase().replace(' ', '_');

      if (groupName === 'Hardcover Books') {
        productType = 'HARDCOVER_BOOK';
      } else if (groupName === 'Softcover Books') {
        productType = 'SOFTCOVER_BOOK';
      } else if (groupName === 'Photo Books') {
        productType = 'PHOTO_BOOK';
      } else if (groupName === 'Specialty Books') {
        if (sku.includes('COM')) {
          productType = 'COMIC_BOOK';
          subcategory = 'COMIC_BOOKS';
        } else if (sku.includes('CHD')) {
          productType = 'CHILDREN_BOOK';
          subcategory = 'CHILDREN_BOOKS';
        } else if (sku.includes('ART')) {
          productType = 'ART_BOOK';
          subcategory = 'ART_BOOKS';
        } else if (sku.includes('LUX')) {
          productType = 'COFFEE_TABLE_BOOK';
          subcategory = 'LUXURY_BOOKS';
        }
      }

      try {
        await prisma.product.upsert({
          where: {
            sku: sku,
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

    for (const [groupName, products] of Object.entries(bookGroups)) {
      console.log(`\nProcessing ${groupName}...`);
      for (const product of products) {
        await updateBook(groupName, product, exchangeRates);
      }
    }
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
