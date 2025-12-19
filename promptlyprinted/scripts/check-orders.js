const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking recent orders...\n');
  
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      status: true,
      total: true,
      prodigiOrderId: true,
      metadata: true,
    },
  });
  
  if (orders.length === 0) {
    console.log('No orders found in database.\n');
  } else {
    console.log(`Found ${orders.length} recent orders:\n`);
    
    orders.forEach((order, i) => {
      const metadata = order.metadata || {};
      console.log(`--- Order ${i + 1} ---`);
      console.log(`ID: ${order.id}`);
      console.log(`Created: ${order.createdAt}`);
      console.log(`Status: ${order.status}`);
      console.log(`Total: ${order.total}`);
      console.log(`Prodigi Order ID: ${order.prodigiOrderId || 'NONE'}`);
      console.log(`Prodigi Error: ${metadata.prodigiError || 'none'}`);
      console.log(`Square Payment ID: ${metadata.squarePaymentId || 'none'}`);
      console.log(`Square Payment Status: ${metadata.squarePaymentStatus || 'none'}`);
      console.log(`Processing Key: ${metadata.prodigiProcessingKey || 'none'}`);
      console.log(`Processing Failed: ${metadata.prodigiProcessingFailed || 'false'}`);
      console.log(`Source: ${metadata.source || 'unknown'}`);
      console.log('');
    });
  }
  
  console.log('\nChecking processing errors...\n');
  
  const errors = await prisma.orderProcessingError.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  
  if (errors.length === 0) {
    console.log('No processing errors found.\n');
  } else {
    console.log(`Found ${errors.length} processing errors:\n`);
    errors.forEach((err, i) => {
      console.log(`--- Error ${i + 1} ---`);
      console.log(`Order ID: ${err.orderId}`);
      console.log(`Error: ${err.error}`);
      console.log(`Retry Count: ${err.retryCount}`);
      console.log(`Last Attempt: ${err.lastAttempt}`);
      console.log('');
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());




