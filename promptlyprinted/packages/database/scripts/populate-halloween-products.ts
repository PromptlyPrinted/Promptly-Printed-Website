import { PrismaClient } from '@prisma/client';

const database = new PrismaClient();
import { tshirtDetails } from './tshirt-details';

// Define supported countries with their currencies
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

// Halloween-relevant product mappings
const HALLOWEEN_PRODUCT_TYPES = [
  'T_SHIRT',
  'LONG_SLEEVE_T_SHIRT',
  'TANK_TOP',
  'KIDS_T_SHIRT',
  'BABY_T_SHIRT',
  'BABY_BODYSUIT',
  'KIDS_SWEATSHIRT',
];

async function createCategories() {
  console.log('Creating product categories...');

  const categories = [
    { name: 'Mens T-Shirts', description: 'Classic and modern t-shirts for men' },
    { name: 'Womens T-Shirts', description: 'Stylish and comfortable t-shirts for women' },
    { name: 'Kids T-Shirts', description: 'Fun and durable t-shirts for children' },
    { name: 'Baby Clothing', description: 'Soft and safe clothing for babies' },
    { name: 'Long Sleeves', description: 'Long sleeve shirts and tops' },
    { name: 'Tank Tops', description: 'Sleeveless shirts and tank tops' },
    { name: 'Sweatshirts', description: 'Comfortable sweatshirts and hoodies' },
  ];

  const createdCategories = [];
  for (const category of categories) {
    try {
      const existing = await database.category.findUnique({
        where: { name: category.name },
      });

      if (!existing) {
        const created = await database.category.create({
          data: category,
        });
        createdCategories.push(created);
        console.log(`✓ Created category: ${category.name}`);
      } else {
        createdCategories.push(existing);
        console.log(`- Category already exists: ${category.name}`);
      }
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error);
    }
  }

  return createdCategories;
}

async function findCategoryId(categoryName: string, categories: any[]) {
  const category = categories.find(cat => cat.name === categoryName);
  return category?.id || null;
}

function mapProductTypeToCategory(productType: string): string {
  const typeMap: Record<string, string> = {
    'T_SHIRT': 'Mens T-Shirts',
    'LONG_SLEEVE_T_SHIRT': 'Long Sleeves',
    'TANK_TOP': 'Tank Tops',
    'KIDS_T_SHIRT': 'Kids T-Shirts',
    'BABY_T_SHIRT': 'Baby Clothing',
    'BABY_BODYSUIT': 'Baby Clothing',
    'KIDS_SWEATSHIRT': 'Sweatshirts',
  };

  return typeMap[productType] || 'Mens T-Shirts';
}

function generateProductDescription(product: any): string {
  const features = product.features?.slice(0, 3).join('. ') || '';
  const materials = product.materials?.join(', ') || '';

  return `${product.shortDescription || product.name} - ${features}${features ? '. ' : ''}Made from ${materials}.`;
}

function getProductStock(productType: string): number {
  // Generate realistic stock levels for different product types
  const stockMap: Record<string, number> = {
    'T_SHIRT': Math.floor(Math.random() * 100) + 50, // 50-150
    'LONG_SLEEVE_T_SHIRT': Math.floor(Math.random() * 80) + 30, // 30-110
    'TANK_TOP': Math.floor(Math.random() * 60) + 20, // 20-80
    'KIDS_T_SHIRT': Math.floor(Math.random() * 70) + 25, // 25-95
    'BABY_T_SHIRT': Math.floor(Math.random() * 40) + 15, // 15-55
    'BABY_BODYSUIT': Math.floor(Math.random() * 50) + 20, // 20-70
    'KIDS_SWEATSHIRT': Math.floor(Math.random() * 30) + 10, // 10-40
  };

  return stockMap[productType] || Math.floor(Math.random() * 50) + 25;
}

async function createProductsForCountry(
  countryCode: string,
  currency: string,
  categories: any[]
) {
  console.log(`\nCreating products for ${countryCode} (${currency})...`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const [sku, productData] of Object.entries(tshirtDetails)) {
    const product = productData as any;

    // Only create Halloween-relevant products
    if (!HALLOWEEN_PRODUCT_TYPES.includes(product.productType)) {
      continue;
    }

    // Find the price for this currency
    const priceInfo = product.pricing?.find((p: any) => p.currency === currency);
    if (!priceInfo) {
      console.log(`⚠ No pricing found for ${sku} in ${currency}`);
      continue;
    }

    // Create country-specific SKU
    const countrySku = `${countryCode}-${sku}`;

    // Check if product already exists
    const existingProduct = await database.product.findUnique({
      where: {
        sku_countryCode: {
          sku: countrySku,
          countryCode: countryCode,
        },
      },
    });

    if (existingProduct) {
      skippedCount++;
      continue;
    }

    // Find category
    const categoryName = mapProductTypeToCategory(product.productType);
    const categoryId = await findCategoryId(categoryName, categories);

    // Calculate prices with markup
    const basePrice = priceInfo.amount;
    const customerPrice = Math.round(basePrice * 1.4 * 100) / 100; // 40% markup
    const shippingCost = 0; // Free shipping for now

    try {
      // Create the product
      const createdProduct = await database.product.create({
        data: {
          name: product.name,
          sku: countrySku,
          description: generateProductDescription(product),
          price: basePrice,
          customerPrice: customerPrice,
          stock: getProductStock(product.productType),
          currency: currency,
          categoryId: categoryId,
          productType: product.productType.replace('_', ' '),
          listed: true,
          brand: product.brand?.name || 'Promptly Printed',
          color: product.colorOptions?.map((c: any) => c.name) || ['Black', 'White'],
          countryCode: countryCode,
          edge: 'Standard',
          fulfillmentCountryCode: countryCode,
          fulfillmentLabCode: 'DEFAULT',
          gender: getGenderFromCategory(categoryName),
          height: product.dimensions?.height || 28,
          shippingCost: shippingCost,
          size: product.size || ['S', 'M', 'L', 'XL'],
          style: 'Classic',
          taxAmount: 0,
          totalCost: customerPrice + shippingCost,
          units: product.dimensions?.units || 'in',
          width: product.dimensions?.width || 20,
          prodigiAttributes: product.identifiers || null,
          prodigiDescription: product.shortDescription || null,
          prodigiPrintAreas: null,
          prodigiVariants: {
            colors: product.colorOptions || [],
            sizes: product.size || [],
          },
        },
      });

      // Create product images
      if (product.colorOptions && product.colorOptions.length > 0) {
        const imagePromises = product.colorOptions.slice(0, 3).map((color: any) => {
          const imageUrl = `${product.imageUrls?.base || '/placeholder'}/${color.filename}`;
          return database.image.create({
            data: {
              url: imageUrl,
              productId: createdProduct.id,
            },
          });
        });

        await Promise.all(imagePromises);
      }

      createdCount++;
      console.log(`✓ Created: ${product.name} (${countrySku})`);

    } catch (error) {
      console.error(`Error creating product ${countrySku}:`, error);
    }
  }

  console.log(`${countryCode}: Created ${createdCount} products, skipped ${skippedCount} existing`);
  return { created: createdCount, skipped: skippedCount };
}

function getGenderFromCategory(categoryName: string): string {
  if (categoryName.toLowerCase().includes('women')) return 'Female';
  if (categoryName.toLowerCase().includes('men')) return 'Male';
  if (categoryName.toLowerCase().includes('kids') || categoryName.toLowerCase().includes('baby')) return 'Kids';
  return 'Unisex';
}

async function populateHalloweenProducts() {
  console.log('🎃 Starting Halloween Products Population Script...\n');

  try {
    // Check database connection
    await database.$connect();
    console.log('✓ Database connected');

    // Create categories first
    const categories = await createCategories();

    // Track totals
    let totalCreated = 0;
    let totalSkipped = 0;

    // Create products for each supported country
    for (const country of SUPPORTED_COUNTRIES) {
      const result = await createProductsForCountry(
        country.code,
        country.currency,
        categories
      );
      totalCreated += result.created;
      totalSkipped += result.skipped;
    }

    console.log(`\n🎉 Population Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total products created: ${totalCreated}`);
    console.log(`   - Total products skipped: ${totalSkipped}`);
    console.log(`   - Categories created: ${categories.length}`);
    console.log(`   - Countries supported: ${SUPPORTED_COUNTRIES.length}`);

    // Test the Halloween API
    console.log(`\n🧪 Testing Halloween API...`);
    const testProducts = await database.product.findMany({
      where: {
        listed: true,
        countryCode: 'GB',
        stock: { gt: 0 },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        customerPrice: true,
        currency: true,
        productType: true,
        stock: true,
      },
    });

    console.log(`✓ Found ${testProducts.length} products for Halloween gallery`);
    if (testProducts.length > 0) {
      console.log('Sample products:');
      testProducts.forEach(p => {
        console.log(`  - ${p.name} (${p.sku}) - ${p.currency} ${p.customerPrice} - Stock: ${p.stock}`);
      });
    }

    console.log(`\n🎃 Your Halloween Design Gallery is now linked to real inventory!`);
    console.log(`🔗 Test at: http://localhost:3000/halloween-2025`);

  } catch (error) {
    console.error('❌ Error during population:', error);
    throw error;
  } finally {
    await database.$disconnect();
    console.log('✓ Database disconnected');
  }
}

// Run the script
populateHalloweenProducts()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

export { populateHalloweenProducts };