
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying discount code fix...');

  // 1. Create a test discount code (uppercase)
  const testCode = 'TEST-DISCOUNT-' + Date.now();
  console.log(`Creating test code: ${testCode}`);
  
  await prisma.discountCode.create({
    data: {
      code: testCode,
      type: 'PERCENTAGE',
      value: 10,
      isActive: true,
    }
  });

  // 2. Try to find it using exact match (should work)
  const exactMatch = await prisma.discountCode.findFirst({
    where: { 
      code: {
        equals: testCode,
        mode: 'insensitive'
      }
    }
  });
  console.log(`Exact match found: ${!!exactMatch}`);

  // 3. Try to find it using lowercase (should work now)
  const lowerCaseCode = testCode.toLowerCase();
  const lowerCaseMatch = await prisma.discountCode.findFirst({
    where: { 
      code: {
        equals: lowerCaseCode,
        mode: 'insensitive'
      }
    }
  });
  console.log(`Lowercase match found: ${!!lowerCaseMatch}`);

  // 4. Try to find it with whitespace (should work with trim())
  const whitespaceCode = `  ${testCode}  `;
  const trimmedCode = whitespaceCode.trim();
  const whitespaceMatch = await prisma.discountCode.findFirst({
    where: { 
      code: {
        equals: trimmedCode,
        mode: 'insensitive'
      }
    }
  });
  console.log(`Whitespace match found: ${!!whitespaceMatch}`);

  // Clean up
  await prisma.discountCode.delete({
    where: { code: testCode }
  });
  console.log('Test code deleted.');

  if (exactMatch && lowerCaseMatch && whitespaceMatch) {
    console.log('SUCCESS: All checks passed!');
  } else {
    console.error('FAILURE: Some checks failed.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
