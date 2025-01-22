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

const bookGroups = {
  "Hardcover Books": [
    { sku: "BOOK-HRD-M", price: "29.99", name: "6x9 Hardcover Book", description: "Professional hardcover book with premium paper and binding, perfect for novels and text-heavy books." },
    { sku: "BOOK-HRD-L", price: "34.99", name: "7x10 Hardcover Book", description: "Large format hardcover book ideal for textbooks and illustrated content." },
    { sku: "BOOK-HRD-XL", price: "39.99", name: "8.5x11 Hardcover Book", description: "Extra large hardcover book perfect for photography and art collections." },
    { sku: "BOOK-HRD-XXL", price: "49.99", name: "12x12 Hardcover Book", description: "Deluxe square format hardcover book, ideal for coffee table books and portfolios." },
  ],
  "Softcover Books": [
    { sku: "BOOK-SFT-M", price: "19.99", name: "6x9 Softcover Book", description: "Professional softcover book with quality paper, perfect for novels and manuals." },
    { sku: "BOOK-SFT-L", price: "24.99", name: "7x10 Softcover Book", description: "Large format softcover book ideal for workbooks and illustrated guides." },
    { sku: "BOOK-SFT-XL", price: "29.99", name: "8.5x11 Softcover Book", description: "Extra large softcover book perfect for magazines and catalogs." },
    { sku: "BOOK-SFT-XXL", price: "39.99", name: "12x12 Softcover Book", description: "Square format softcover book, great for art books and portfolios." },
  ],
  "Photo Books": [
    { sku: "PHBK-PRO-20", price: "34.99", name: "8x8 Photo Book", description: "Professional photo book with 20 pages of premium photo paper." },
    { sku: "PHBK-PRO-30", price: "44.99", name: "10x10 Photo Book", description: "Deluxe photo book with 30 pages of archival quality photo paper." },
    { sku: "PHBK-PRO-40", price: "54.99", name: "11x14 Photo Book", description: "Premium landscape photo book with 40 pages of professional photo paper." },
    { sku: "PHBK-PRO-50", price: "49.99", name: "12x12 Photo Book", description: "Square format photo book with 50 pages of gallery-quality photo paper." },
  ],
  "Specialty Books": [
    { sku: "BOOK-COM-STD", price: "24.99", name: "Comic Book Format", description: "Standard comic book format with premium paper and vibrant color printing." },
    { sku: "BOOK-CHD-STD", price: "29.99", name: "Children's Book Format", description: "Child-friendly format with durable pages and vivid colors." },
    { sku: "BOOK-ART-PRO", price: "59.99", name: "Art Book Format", description: "Museum-quality art book with color-accurate printing and premium finish." },
    { sku: "BOOK-LUX-PRO", price: "69.99", name: "Coffee Table Book", description: "Luxury oversized book with premium paper and professional binding." },
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
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
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

async function updateBook(
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
            productType,
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
