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

const footwearGroups = {
  "Men's Socks": [
    { sku: "SOCK-M-CREW-BLK", price: "14.99" },     // Men's Black Crew Socks
    { sku: "SOCK-M-ANKLE-BLK", price: "12.99" },    // Men's Black Ankle Socks
    { sku: "SOCK-M-CREW-WHT", price: "14.99" },     // Men's White Crew Socks
    { sku: "SOCK-M-ANKLE-WHT", price: "12.99" },    // Men's White Ankle Socks
    { sku: "SOCK-M-DRESS-BLK", price: "16.99" },    // Men's Black Dress Socks
  ],
  "Women's Socks": [
    { sku: "SOCK-W-CREW-BLK", price: "14.99" },     // Women's Black Crew Socks
    { sku: "SOCK-W-ANKLE-BLK", price: "12.99" },    // Women's Black Ankle Socks
    { sku: "SOCK-W-CREW-WHT", price: "14.99" },     // Women's White Crew Socks
    { sku: "SOCK-W-ANKLE-WHT", price: "12.99" },    // Women's White Ankle Socks
    { sku: "SOCK-W-NOSHOW-BLK", price: "11.99" },   // Women's Black No-Show Socks
  ],
  "Men's Flip-Flops": [
    { sku: "FLIP-M-S-BLK", price: "24.99" },        // Men's Small Black Flip-Flops
    { sku: "FLIP-M-M-BLK", price: "24.99" },        // Men's Medium Black Flip-Flops
    { sku: "FLIP-M-L-BLK", price: "24.99" },        // Men's Large Black Flip-Flops
    { sku: "FLIP-M-XL-BLK", price: "24.99" },       // Men's XL Black Flip-Flops
  ],
  "Women's Flip-Flops": [
    { sku: "FLIP-W-S-BLK", price: "24.99" },        // Women's Small Black Flip-Flops
    { sku: "FLIP-W-M-BLK", price: "24.99" },        // Women's Medium Black Flip-Flops
    { sku: "FLIP-W-L-BLK", price: "24.99" },        // Women's Large Black Flip-Flops
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

async function updateFootwear(
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

      // Determine product type and gender based on group name and SKU
      let productType = 'SOCKS';
      let gender = groupName.toLowerCase().includes('men') ? 'Male' : 'Female';

      if (sku.includes('FLIP')) {
        productType = 'FLIP_FLOPS';
      } else if (sku.includes('SOCK')) {
        if (sku.includes('CREW')) productType = 'CREW_SOCKS';
        else if (sku.includes('ANKLE')) productType = 'ANKLE_SOCKS';
        else if (sku.includes('NOSHOW')) productType = 'NO_SHOW_SOCKS';
        else if (sku.includes('DRESS')) productType = 'DRESS_SOCKS';
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
        gender,
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

    for (const [groupName, products] of Object.entries(footwearGroups)) {
      console.log(`\nProcessing ${groupName}...`);
      for (const product of products) {
        await updateFootwear(groupName, product, exchangeRates);
      }
    }
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 