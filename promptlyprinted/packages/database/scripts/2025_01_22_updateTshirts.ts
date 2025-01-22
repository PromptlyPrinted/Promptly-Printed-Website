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
  { code: 'CN', currency: 'CNY' }
];

const tshirtGroups = {
  "Men's T-shirts": {
    basePrice: 29.99,
    products: [
      { 
        sku: 'MT-CREW-BLK-S', 
        name: "Men's Black Crew Neck T-Shirt - Small",
        description: "Classic black crew neck t-shirt for men in size Small. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-BLK-M', 
        name: "Men's Black Crew Neck T-Shirt - Medium",
        description: "Classic black crew neck t-shirt for men in size Medium. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-BLK-L', 
        name: "Men's Black Crew Neck T-Shirt - Large",
        description: "Classic black crew neck t-shirt for men in size Large. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-BLK-XL', 
        name: "Men's Black Crew Neck T-Shirt - XL",
        description: "Classic black crew neck t-shirt for men in size XL. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-BLK-2XL', 
        name: "Men's Black Crew Neck T-Shirt - 2XL",
        description: "Classic black crew neck t-shirt for men in size 2XL. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-WHT-S', 
        name: "Men's White Crew Neck T-Shirt - Small",
        description: "Classic white crew neck t-shirt for men in size Small. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-WHT-M', 
        name: "Men's White Crew Neck T-Shirt - Medium",
        description: "Classic white crew neck t-shirt for men in size Medium. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-WHT-L', 
        name: "Men's White Crew Neck T-Shirt - Large",
        description: "Classic white crew neck t-shirt for men in size Large. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-WHT-XL', 
        name: "Men's White Crew Neck T-Shirt - XL",
        description: "Classic white crew neck t-shirt for men in size XL. Made with premium cotton for comfort and durability."
      },
      { 
        sku: 'MT-CREW-WHT-2XL', 
        name: "Men's White Crew Neck T-Shirt - 2XL",
        description: "Classic white crew neck t-shirt for men in size 2XL. Made with premium cotton for comfort and durability."
      }
    ]
  }
};

async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json() as { rates: Record<string, number> };
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
          sku: sku
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
          productType: "T-SHIRT",
          listed: true,
          width: 24,
          height: 36,
          units: "IN",
          brand: "Custom Brand",
          edge: "Standard",
          color: ["Black", "White"],
          gender: "Men",
          size: ["S", "M", "L", "XL", "2XL"],
          style: "Crew Neck",
          countryCode: country.code,
          category: {
            connect: {
              name: "T-Shirts"
            }
          },
          updatedAt: new Date()
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
          productType: "T-SHIRT",
          listed: true,
          width: 24,
          height: 36,
          units: "IN",
          brand: "Custom Brand",
          edge: "Standard",
          color: ["Black", "White"],
          gender: "Men",
          size: ["S", "M", "L", "XL", "2XL"],
          style: "Crew Neck",
          countryCode: country.code,
          category: {
            connectOrCreate: {
              where: { name: "T-Shirts" },
              create: { name: "T-Shirts" }
            }
          }
        }
      });
      
      console.log(`Updated ${sku} for ${country.code} (${country.currency} ${localPrice})`);
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
    
    for (const product of group.products) {
      console.log(`Processing ${groupName} - ${product.sku}`);
      await updateTshirt(
        product.sku,
        product.name,
        product.description,
        group.basePrice,
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