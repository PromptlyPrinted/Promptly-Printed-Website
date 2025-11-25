/**
 * Monthly Credit Reset Script
 *
 * This script resets monthly credits for all users.
 * Run this at the start of each month via cron job or manually.
 *
 * Usage:
 *   npx tsx scripts/reset-monthly-credits.ts
 *
 * Cron Setup (run on 1st of each month at 12:00 AM UTC):
 *   0 0 1 * * cd /path/to/app && npx tsx scripts/reset-monthly-credits.ts
 */

import { prisma } from '@repo/database';
import { MONTHLY_CREDITS } from '../lib/credits';

async function resetMonthlyCreditsForAllUsers() {
  console.log('🔄 Starting monthly credit reset...');
  console.log(`📅 Date: ${new Date().toISOString()}`);

  try {
    // Get all users who need a reset
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Find all user credits where lastMonthlyReset is from a previous month
    const userCredits = await prisma.userCredits.findMany({
      select: {
        id: true,
        userId: true,
        credits: true,
        lastMonthlyReset: true,
      },
    });

    console.log(`👥 Found ${userCredits.length} users to check`);

    let resetCount = 0;
    let skippedCount = 0;

    for (const userCredit of userCredits) {
      const lastReset = new Date(userCredit.lastMonthlyReset);
      const needsReset =
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear();

      if (needsReset) {
        // Reset credits
        const updated = await prisma.userCredits.update({
          where: { id: userCredit.id },
          data: {
            credits: MONTHLY_CREDITS,
            monthlyCredits: MONTHLY_CREDITS,
            monthlyCreditsUsed: 0,
            lastMonthlyReset: now,
            lifetimeCredits: {
              increment: MONTHLY_CREDITS,
            },
          },
        });

        // Record transaction
        await prisma.creditTransaction.create({
          data: {
            userId: userCredit.userId,
            amount: MONTHLY_CREDITS,
            balance: updated.credits,
            type: 'MONTHLY_RESET',
            reason: `Monthly credit reset for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          },
        });

        resetCount++;
        console.log(`✅ Reset credits for user ${userCredit.userId} (${resetCount}/${userCredits.length})`);
      } else {
        skippedCount++;
      }
    }

    console.log('\n📊 Reset Summary:');
    console.log(`✅ Credits reset: ${resetCount} users`);
    console.log(`⏭️  Already up to date: ${skippedCount} users`);
    console.log(`💰 Credits allocated: ${MONTHLY_CREDITS} per user`);
    console.log(`🎉 Total credits granted: ${resetCount * MONTHLY_CREDITS}`);
    console.log('\n✨ Monthly credit reset completed successfully!');

    return {
      success: true,
      resetCount,
      skippedCount,
      creditsPerUser: MONTHLY_CREDITS,
      totalCreditsGranted: resetCount * MONTHLY_CREDITS,
    };

  } catch (error) {
    console.error('❌ Error during monthly credit reset:', error);
    throw error;
  }
}

// Run the script
resetMonthlyCreditsForAllUsers()
  .then((result) => {
    console.log('\n✅ Script completed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
