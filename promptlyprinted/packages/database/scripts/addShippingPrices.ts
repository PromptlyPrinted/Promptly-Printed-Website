import { PrismaClient, ShippingMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shippingPrices = [
    {
      method: ShippingMethod.BUDGET,
      basePrice: 4.99,
      additionalItemPrice: 1.99,
      currency: 'USD'
    },
    {
      method: ShippingMethod.STANDARD,
      basePrice: 7.99,
      additionalItemPrice: 2.99,
      currency: 'USD'
    },
    {
      method: ShippingMethod.EXPRESS,
      basePrice: 14.99,
      additionalItemPrice: 4.99,
      currency: 'USD'
    },
    {
      method: ShippingMethod.OVERNIGHT,
      basePrice: 24.99,
      additionalItemPrice: 7.99,
      currency: 'USD'
    }
  ];

  for (const price of shippingPrices) {
    await prisma.shippingPrice.upsert({
      where: {
        method_currency: {
          method: price.method,
          currency: price.currency
        }
      },
      update: price,
      create: price
    });
  }

  console.log('Shipping prices have been added successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 