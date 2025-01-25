import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all products and categories...');
  
  // Delete all products first (due to foreign key constraints)
  await prisma.product.deleteMany({});
  console.log('All products deleted');
  
  // Then delete all categories
  await prisma.category.deleteMany({});
  console.log('All categories deleted');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 