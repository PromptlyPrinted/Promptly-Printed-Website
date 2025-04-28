import { PrismaClient } from '@prisma/client';
import { tshirtDetails } from './tshirt-details';

const prisma = new PrismaClient();

async function main() {
  for (const [sku, details] of Object.entries(tshirtDetails)) {
    // Find the product in the DB
    const product = await prisma.product.findUnique({ where: { sku_countryCode: { sku, countryCode: 'US' } } });
    if (!product) {
      console.warn(`Product not found for SKU: ${sku}`);
      continue;
    }
    for (const price of details.pricing) {
      await prisma.productPrice.upsert({
        where: { productId_currency: { productId: product.id, currency: price.currency } },
        update: { amount: price.amount },
        create: { productId: product.id, currency: price.currency, amount: price.amount },
      });
      console.log(`Inserted price for ${sku} in ${price.currency}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
