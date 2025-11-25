/**
 * Seed Credit Packs
 * Creates the default credit pack offerings in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREDIT_PACKS = [
  {
    name: 'Starter Pack',
    credits: 25,
    price: 4.99,
    currency: 'USD',
    bonusCredits: 0,
    isActive: true,
    displayOrder: 1,
    isPopular: false,
    metadata: {
      description: 'Perfect for trying out premium models',
      savingsPercent: 0,
      pricePerCredit: 0.20,
    },
  },
  {
    name: 'Creator Pack',
    credits: 100,
    price: 14.99,
    currency: 'USD',
    bonusCredits: 10, // Get 110 total
    isActive: true,
    displayOrder: 2,
    isPopular: true, // Most popular
    metadata: {
      description: 'Most popular - Best value for regular creators',
      savingsPercent: 25,
      pricePerCredit: 0.14,
      badge: 'BEST VALUE',
    },
  },
  {
    name: 'Pro Pack',
    credits: 250,
    price: 29.99,
    currency: 'USD',
    bonusCredits: 50, // Get 300 total
    isActive: true,
    displayOrder: 3,
    isPopular: false,
    metadata: {
      description: 'For power users and businesses',
      savingsPercent: 40,
      pricePerCredit: 0.10,
      badge: 'PRO',
    },
  },
  {
    name: 'Enterprise Pack',
    credits: 500,
    price: 49.99,
    currency: 'USD',
    bonusCredits: 150, // Get 650 total
    isActive: true,
    displayOrder: 4,
    isPopular: false,
    metadata: {
      description: 'Maximum value for high-volume users',
      savingsPercent: 50,
      pricePerCredit: 0.08,
      badge: 'ENTERPRISE',
    },
  },
];

async function main() {
  console.log('🌱 Seeding credit packs...');

  for (const pack of CREDIT_PACKS) {
    const existing = await prisma.creditPack.findFirst({
      where: { name: pack.name },
    });

    if (existing) {
      // Update existing pack
      await prisma.creditPack.update({
        where: { id: existing.id },
        data: pack,
      });
      console.log(`✅ Updated: ${pack.name}`);
    } else {
      // Create new pack
      await prisma.creditPack.create({
        data: pack,
      });
      console.log(`✨ Created: ${pack.name}`);
    }
  }

  // Display the seeded packs
  console.log('\n📦 Credit Packs:');
  const packs = await prisma.creditPack.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  packs.forEach((pack) => {
    const totalCredits = pack.credits + pack.bonusCredits;
    const pricePerCredit = pack.price / totalCredits;
    console.log(`
  ${pack.isPopular ? '⭐' : '  '} ${pack.name}
     Price: $${pack.price.toFixed(2)}
     Credits: ${pack.credits}${pack.bonusCredits > 0 ? ` + ${pack.bonusCredits} bonus` : ''}
     Total: ${totalCredits} credits
     Per Credit: $${pricePerCredit.toFixed(3)}
    `);
  });

  console.log('\n✅ Credit packs seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding credit packs:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
