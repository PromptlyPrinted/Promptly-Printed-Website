import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupBlackFridayCompetition() {
  try {
    console.log('Setting up Black Friday 2025 competition...');

    // First, deactivate the Halloween competition
    await prisma.competition.updateMany({
      where: {
        funnelTag: 'halloween-2025',
      },
      data: {
        isActive: false,
      },
    });
    console.log('Deactivated Halloween competition');

    // Check if Black Friday competition already exists
    const existing = await prisma.competition.findUnique({
      where: {
        funnelTag: 'black-friday-2025',
      },
    });

    if (existing) {
      // Update existing competition
      const updated = await prisma.competition.update({
        where: {
          funnelTag: 'black-friday-2025',
        },
        data: {
          theme: 'Black Friday 2025',
          themeIcon: '🛍️',
          prize: '$200 Cash Prize',
          startDate: new Date('2025-11-21'), // Black Friday typically around Nov 21-29
          endDate: new Date('2025-11-29T23:59:59Z'),
          description: 'Create your custom Black Friday design and enter to win $200 cash! Show off your creativity and compete for the top prize. Competition ends November 29th, 2025.',
          isActive: true,
        },
      });
      console.log('Updated existing Black Friday competition:', updated);
    } else {
      // Create new competition
      const competition = await prisma.competition.create({
        data: {
          theme: 'Black Friday 2025',
          themeIcon: '🛍️',
          prize: '$200 Cash Prize',
          startDate: new Date('2025-11-21'),
          endDate: new Date('2025-11-29T23:59:59Z'),
          description: 'Create your custom Black Friday design and enter to win $200 cash! Show off your creativity and compete for the top prize. Competition ends November 29th, 2025.',
          funnelTag: 'black-friday-2025',
          isActive: true,
        },
      });
      console.log('Created new Black Friday competition:', competition);
    }

    console.log('Black Friday competition setup complete!');
  } catch (error) {
    console.error('Error setting up Black Friday competition:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupBlackFridayCompetition();
