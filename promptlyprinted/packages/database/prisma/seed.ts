// @ts-nocheck
import { PrismaClient } from '@prisma/client';

// Create two Prisma clients - one for source (EA) and one for target (GA)
const sourceClient = new PrismaClient({
  datasourceUrl: process.env.SOURCE_DATABASE_URL,
});

const targetClient = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('Starting data migration...');

  // Migrate Categories first (they are referenced by Products)
  console.log('Migrating categories...');
  const categories = await sourceClient.category.findMany();
  for (const category of categories) {
    await targetClient.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
  }

  // Migrate Products
  console.log('Migrating products...');
  const products = await sourceClient.product.findMany({
    include: {
      category: true,
      images: true,
    },
  });
  for (const product of products) {
    await targetClient.product.upsert({
      where: { id: product.id },
      update: {
        ...product,
        categoryId: product.category?.id,
      },
      create: {
        ...product,
        categoryId: product.category?.id,
      },
    });
  }

  // Migrate Users
  console.log('Migrating users...');
  const users = await sourceClient.user.findMany();
  for (const user of users) {
    await targetClient.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }

  // Migrate Orders and related data
  console.log('Migrating orders...');
  const orders = await sourceClient.order.findMany({
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      payment: true,
      recipient: true,
      shipments: {
        include: {
          items: true,
        },
      },
      charges: {
        include: {
          items: true,
        },
      },
    },
  });

  for (const order of orders) {
    await targetClient.order.upsert({
      where: { id: order.id },
      update: {
        ...order,
        orderItems: {
          create: order.orderItems.map((item) => ({
            ...item,
            productId: item.product.id,
          })),
        },
        shipments: {
          create: order.shipments.map((shipment) => ({
            ...shipment,
            items: {
              create: shipment.items,
            },
          })),
        },
        charges: {
          create: order.charges.map((charge) => ({
            ...charge,
            items: {
              create: charge.items,
            },
          })),
        },
      },
      create: {
        ...order,
        orderItems: {
          create: order.orderItems.map((item) => ({
            ...item,
            productId: item.product.id,
          })),
        },
        shipments: {
          create: order.shipments.map((shipment) => ({
            ...shipment,
            items: {
              create: shipment.items,
            },
          })),
        },
        charges: {
          create: order.charges.map((charge) => ({
            ...charge,
            items: {
              create: charge.items,
            },
          })),
        },
      },
    });
  }

  // Migrate Quotes
  console.log('Migrating quotes...');
  const quotes = await sourceClient.quote.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      costSummary: true,
      shipments: true,
    },
  });

  for (const quote of quotes) {
    await targetClient.quote.upsert({
      where: { id: quote.id },
      update: {
        ...quote,
        items: {
          create: quote.items.map((item) => ({
            ...item,
            productId: item.product.id,
          })),
        },
      },
      create: {
        ...quote,
        items: {
          create: quote.items.map((item) => ({
            ...item,
            productId: item.product.id,
          })),
        },
      },
    });
  }

  // Migrate Shipping Prices
  console.log('Migrating shipping prices...');
  const shippingPrices = await sourceClient.shippingPrice.findMany();
  for (const price of shippingPrices) {
    await targetClient.shippingPrice.upsert({
      where: { id: price.id },
      update: price,
      create: price,
    });
  }

  console.log('Data migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await sourceClient.$disconnect();
    await targetClient.$disconnect();
  }); 