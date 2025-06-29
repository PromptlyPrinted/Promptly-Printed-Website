import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSystemUser() {
  try {
    console.log('Creating system user...');

    // Create or update the system user
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@promptlyprinted.com' },
      create: {
        email: 'system@promptlyprinted.com',
        firstName: 'System',
        lastName: 'User',
        role: 'ADMIN',
      },
      update: {
        role: 'ADMIN',
      },
    });

    console.log('System user created/updated:', systemUser);
  } catch (error) {
    console.error('Error creating system user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSystemUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
