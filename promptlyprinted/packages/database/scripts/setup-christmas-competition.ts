import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupChristmasCompetition() {
  try {
    console.log('Setting up Christmas 2025 competition...');

    // First, deactivate the Black Friday competition
    await prisma.competition.updateMany({
      where: {
        funnelTag: 'black-friday-2025',
      },
      data: {
        isActive: false,
      },
    });
    console.log('Deactivated Black Friday competition');

    // Check if Christmas competition already exists
    const existing = await prisma.competition.findUnique({
      where: {
        funnelTag: 'christmas-2025',
      },
    });

    if (existing) {
      // Update existing competition
      const updated = await prisma.competition.update({
        where: {
          funnelTag: 'christmas-2025',
        },
        data: {
          theme: 'Christmas 2025',
          themeIcon: '🎄',
          prize: '$500 USD Cash Prize',
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-31T23:59:59Z'),
          description: 'Create your custom Christmas design and enter to win $500 USD cash! Show off your creativity and compete for the top prize. Earn points through likes (5 pts), wearing photos (100 pts), and social follows (50 pts). Competition ends December 31st, 2025. Winner announced January 5th, 2026.',
          isActive: true,
        },
      });
      console.log('Updated existing Christmas competition:', updated);
    } else {
      // Create new competition
      const competition = await prisma.competition.create({
        data: {
          theme: 'Christmas 2025',
          themeIcon: '🎄',
          prize: '$500 USD Cash Prize',
          startDate: new Date('2025-12-01'),
          endDate: new Date('2025-12-31T23:59:59Z'),
          description: 'Create your custom Christmas design and enter to win $500 USD cash! Show off your creativity and compete for the top prize. Earn points through likes (5 pts), wearing photos (100 pts), and social follows (50 pts). Competition ends December 31st, 2025. Winner announced January 5th, 2026.',
          funnelTag: 'christmas-2025',
          isActive: true,
        },
      });
      console.log('Created new Christmas competition:', competition);
    }

    console.log('Christmas competition setup complete!');
  } catch (error) {
    console.error('Error setting up Christmas competition:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupChristmasCompetition();
