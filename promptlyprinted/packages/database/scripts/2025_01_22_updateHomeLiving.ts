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

const homeLivingGroups = {
  "Drinkware": [
    { sku: "MUG-CERAM-11", price: "24.99" },      // 11oz Ceramic Mug
    { sku: "MUG-CERAM-15", price: "26.99" },      // 15oz Ceramic Mug
    { sku: "MUG-ENAMEL-10", price: "29.99" },     // 10oz Enamel Mug
    { sku: "BOTTLE-WATER-20", price: "34.99" },    // 20oz Water Bottle
    { sku: "TUMBLER-20", price: "32.99" },        // 20oz Tumbler
  ],
  "Kitchen": [
    { sku: "APRON-FULL-STD", price: "34.99" },    // Full Apron
    { sku: "CUTTING-BOARD-M", price: "39.99" },    // Medium Cutting Board
    { sku: "CUTTING-BOARD-L", price: "49.99" },    // Large Cutting Board
    { sku: "PLACEMAT-SET-4", price: "44.99" },    // Set of 4 Placemats
    { sku: "COASTER-SET-4", price: "29.99" },     // Set of 4 Coasters
  ],
  "Decor": [
    { sku: "CANVAS-16X20", price: "69.99" },      // 16x20 Canvas Print
    { sku: "CANVAS-24X36", price: "99.99" },      // 24x36 Canvas Print
    { sku: "POSTER-18X24", price: "29.99" },      // 18x24 Poster
    { sku: "FRAME-8X10", price: "39.99" },        // 8x10 Framed Print
    { sku: "PILLOW-18X18", price: "44.99" },      // 18x18 Throw Pillow
    { sku: "BLANKET-50X60", price: "64.99" },     // 50x60 Throw Blanket
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

async function updateHomeLiving(
  groupName: string,
  { sku, price }: { sku: string; price: string },
  exchangeRates: Record<string, number>
) {
  try {
    console.log(`Processing ${groupName} - ${sku}`);

    const product = await getProdigiProduct(sku);
    if (!product) {
      console.error(`Could not fetch product data for ${sku}`);
      return;
    }

    const priceUSD = parseFloat(price);

    // For each supported country that the product ships to
    for (const country of SUPPORTED_COUNTRIES) {
      const { code: countryCode, currency } = country;

      // Check if product ships to this country
      const shipsToCountry = product.variants.some(v => 
        v.shipsTo.includes(countryCode)
      );

      if (!shipsToCountry) {
        console.log(`${sku} does not ship to ${countryCode}, skipping...`);
        continue;
      }

      // Convert price to local currency
      const localPrice = await convertPrice(priceUSD, currency, exchangeRates);

      // Determine product type based on group name
      let productType = 'HOME_DECOR';
      if (groupName === 'Drinkware') productType = 'DRINKWARE';
      else if (groupName === 'Kitchen') productType = 'KITCHEN';
      else if (groupName === 'Decor') {
        if (sku.includes('CANVAS')) productType = 'CANVAS';
        else if (sku.includes('POSTER')) productType = 'POSTER';
        else if (sku.includes('FRAME')) productType = 'FRAMED_PRINT';
        else if (sku.includes('PILLOW')) productType = 'PILLOW';
        else if (sku.includes('BLANKET')) productType = 'BLANKET';
      }

      // Create product data
      const productData = {
        name: product.description,
        description: product.description,
        sku: `${sku}-${countryCode}`,
        price: priceUSD,
        customerPrice: localPrice,
        currency,
        shippingCost: 0, // Will be updated when shipping quotes are implemented
        taxAmount: 0,
        totalCost: priceUSD,
        stock: 10000,
        productType,
        width: product.productDimensions.width,
        height: product.productDimensions.height,
        units: product.productDimensions.units,
        brand: product.attributes.brand?.[0] || '',
        edge: product.attributes.edge?.[0] || '',
        color: product.attributes.color || [],
        gender: 'Unisex',
        size: product.attributes.size || [],
        style: product.attributes.style?.[0] || '',
        countryCode,
        listed: true,
        prodigiDescription: product.description,
        prodigiAttributes: product.attributes,
        prodigiVariants: product.variants,
      };

      // Upsert the product
      await prisma.product.upsert({
        where: { sku: productData.sku },
        update: productData,
        create: {
          ...productData,
          category: {
            connectOrCreate: {
              where: { name: groupName },
              create: { name: groupName },
            },
          },
        },
      });

      console.log(`Updated ${productData.sku} for ${countryCode} (${currency} ${localPrice})`);
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

    for (const [groupName, products] of Object.entries(homeLivingGroups)) {
      console.log(`\nProcessing ${groupName}...`);
      for (const product of products) {
        await updateHomeLiving(groupName, product, exchangeRates);
      }
    }
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 