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
  "Dog Apparel": [
    { sku: "PET-DOG-SHIRT-S", price: "19.99", name: "Dog T-Shirt Small", description: "Comfortable cotton t-shirt for small dogs, perfect for everyday wear." },
    { sku: "PET-DOG-SHIRT-M", price: "24.99", name: "Dog T-Shirt Medium", description: "Comfortable cotton t-shirt for medium dogs, perfect for everyday wear." },
    { sku: "PET-DOG-SHIRT-L", price: "29.99", name: "Dog T-Shirt Large", description: "Comfortable cotton t-shirt for large dogs, perfect for everyday wear." },
    { sku: "PET-DOG-HOOD-S", price: "29.99", name: "Dog Hoodie Small", description: "Cozy hoodie for small dogs, great for cool weather." },
    { sku: "PET-DOG-HOOD-M", price: "34.99", name: "Dog Hoodie Medium", description: "Cozy hoodie for medium dogs, great for cool weather." },
    { sku: "PET-DOG-HOOD-L", price: "39.99", name: "Dog Hoodie Large", description: "Cozy hoodie for large dogs, great for cool weather." }
  ],
  "Cat Apparel": [
    { sku: "PET-CAT-SHIRT-S", price: "17.99", name: "Cat T-Shirt Small", description: "Soft cotton t-shirt for small cats, comfortable and stylish." },
    { sku: "PET-CAT-SHIRT-M", price: "19.99", name: "Cat T-Shirt Medium", description: "Soft cotton t-shirt for medium cats, comfortable and stylish." },
    { sku: "PET-CAT-SHIRT-L", price: "21.99", name: "Cat T-Shirt Large", description: "Soft cotton t-shirt for large cats, comfortable and stylish." },
    { sku: "PET-CAT-HOOD-S", price: "24.99", name: "Cat Hoodie Small", description: "Warm hoodie for small cats, perfect for indoor wear." },
    { sku: "PET-CAT-HOOD-M", price: "27.99", name: "Cat Hoodie Medium", description: "Warm hoodie for medium cats, perfect for indoor wear." },
    { sku: "PET-CAT-HOOD-L", price: "29.99", name: "Cat Hoodie Large", description: "Warm hoodie for large cats, perfect for indoor wear." }
  ],
  "Pet Accessories": [
    { sku: "PET-BAND-SM", price: "9.99", name: "Pet Bandana Small", description: "Stylish bandana for small pets, adjustable fit." },
    { sku: "PET-BAND-MD", price: "11.99", name: "Pet Bandana Medium", description: "Stylish bandana for medium pets, adjustable fit." },
    { sku: "PET-BAND-LG", price: "13.99", name: "Pet Bandana Large", description: "Stylish bandana for large pets, adjustable fit." },
    { sku: "PET-BOW-UNI", price: "7.99", name: "Pet Bow Tie", description: "Elegant bow tie for pets, one size fits most." },
    { sku: "PET-CAP-ADJ", price: "14.99", name: "Pet Baseball Cap", description: "Adjustable baseball cap for pets with ear holes." },
    { sku: "PET-SCARF-UNI", price: "16.99", name: "Pet Scarf", description: "Fashionable scarf for pets, suitable for all seasons." }
  ],
  "Pet Beds": [
    { sku: "PET-BED-SM", price: "29.99", name: "Pet Bed Small", description: "Cozy bed for small pets with custom printed design." },
    { sku: "PET-BED-MD", price: "39.99", name: "Pet Bed Medium", description: "Comfortable bed for medium pets with custom printed design." },
    { sku: "PET-BED-LG", price: "49.99", name: "Pet Bed Large", description: "Spacious bed for large pets with custom printed design." },
    { sku: "PET-MAT-SM", price: "19.99", name: "Pet Mat Small", description: "Portable mat for small pets with custom design." },
    { sku: "PET-MAT-MD", price: "24.99", name: "Pet Mat Medium", description: "Portable mat for medium pets with custom design." },
    { sku: "PET-MAT-LG", price: "29.99", name: "Pet Mat Large", description: "Portable mat for large pets with custom design." }
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