import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating discount codes...\n');

  try {
    // Create WELCOME10 - 10% off, one use per user
    const welcome10 = await prisma.discountCode.create({
      data: {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        maxUsesPerUser: 1,
        isActive: true,
        metadata: {
          description: 'Welcome discount for new customers',
        },
      },
    });

    console.log('✅ Created WELCOME10');
    console.log('   Type: 10% off');
    console.log('   Limit: One use per user\n');

    // Create NATHAN99 - 99.9% off
    const nathan99 = await prisma.discountCode.create({
      data: {
        code: 'NATHAN99',
        type: 'PERCENTAGE',
        value: 99.9,
        isActive: true,
        metadata: {
          description: 'Nathan special discount - 99.9% off',
        },
      },
    });

    console.log('✅ Created NATHAN99');
    console.log('   Type: 99.9% off');
    console.log('   Limit: Unlimited\n');

    console.log('🎉 All discount codes created successfully!');
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ One or more discount codes already exist. Skipping...');
    } else {
      console.error('❌ Error creating discount codes:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
