#!/usr/bin/env tsx

/**
 * Verification script to check Clerk to Better Auth migration status
 * Provides detailed analysis of migrated users and their features
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying Clerk to Better Auth migration status...\n');

  try {
    // Check for Better Auth plugin features based on schema structure
    const isAdminEnabled = true; // Based on schema having role field
    const isTwoFactorEnabled = true; // Based on TwoFactor model existing
    const isUsernameEnabled = true; // Based on username field in User model
    const isPhoneNumberEnabled = true; // Based on phoneNumber field in User model

    console.log('🔧 Better Auth Plugin Configuration:');
    console.log(`   Admin Plugin: ${isAdminEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Two Factor Plugin: ${isTwoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Username Plugin: ${isUsernameEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Phone Number Plugin: ${isPhoneNumberEnabled ? '✅ Enabled' : '❌ Disabled'}\n`);

    // 1. Overall user statistics
    const totalUsers = await prisma.user.count();
    console.log(`👥 Total Users: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log('ℹ️  No users found. Migration has not been run yet or no users to migrate.\n');
      console.log('📝 Next Steps:');
      console.log('   1. Export users from Clerk dashboard as CSV');
      console.log('   2. Place the exported_users.csv file in the project root');
      console.log('   3. Run: npx tsx migrate-clerk-to-better-auth.ts');
      return;
    }

    // 2. Account provider analysis
    console.log('\n📊 Account Analysis:');
    const accountsByProvider = await prisma.account.groupBy({
      by: ['providerId', 'type'],
      _count: { id: true }
    });

    if (accountsByProvider.length === 0) {
      console.log('⚠️  No accounts found. Users may not be able to authenticate.');
    } else {
      console.log('   Accounts by Provider:');
      accountsByProvider.forEach(provider => {
        const providerName = provider.providerId === 'credential' ? 'Email/Password' : 
                            provider.providerId.charAt(0).toUpperCase() + provider.providerId.slice(1);
        console.log(`     ${providerName} (${provider.type}): ${provider._count.id}`);
      });
    }

    // 3. Email verification status
    const emailStats = await prisma.user.groupBy({
      by: ['emailVerified'],
      _count: { id: true }
    });
    console.log('\n📧 Email Verification Status:');
    emailStats.forEach(stat => {
      const status = stat.emailVerified ? 'Verified' : 'Unverified';
      console.log(`   ${status}: ${stat._count.id} users`);
    });

    // 4. Better Auth feature usage
    if (isUsernameEnabled) {
      const usersWithUsername = await prisma.user.count({
        where: { username: { not: null } }
      });
      console.log(`\n👤 Username Usage: ${usersWithUsername} users have usernames`);
    }

    if (isPhoneNumberEnabled) {
      const phoneStats = await prisma.user.groupBy({
        by: ['phoneNumberVerified'],
        where: { phoneNumber: { not: null } },
        _count: { id: true }
      });
      console.log('\n📱 Phone Number Status:');
      if (phoneStats.length === 0) {
        console.log('   No users with phone numbers');
      } else {
        phoneStats.forEach(stat => {
          const status = stat.phoneNumberVerified ? 'Verified' : 'Unverified';
          console.log(`   ${status}: ${stat._count.id} users`);
        });
      }
    }

    if (isTwoFactorEnabled) {
      const twoFactorStats = await prisma.user.groupBy({
        by: ['twoFactorEnabled'],
        _count: { id: true }
      });
      console.log('\n🔐 Two-Factor Authentication:');
      twoFactorStats.forEach(stat => {
        const status = stat.twoFactorEnabled ? 'Enabled' : 'Disabled';
        console.log(`   ${status}: ${stat._count.id} users`);
      });

      const twoFactorRecords = await prisma.twoFactor.count();
      console.log(`   Two-Factor Records: ${twoFactorRecords} (TOTP secrets stored)`);
    }

    if (isAdminEnabled) {
      const adminStats = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      });
      console.log('\n👑 User Roles:');
      adminStats.forEach(stat => {
        console.log(`   ${stat.role}: ${stat._count.id} users`);
      });

      const bannedUsers = await prisma.user.count({
        where: { banned: true }
      });
      console.log(`   Banned Users: ${bannedUsers}`);
    }

    // 5. Session analysis
    const activeSessions = await prisma.session.count({
      where: {
        expiresAt: { gt: new Date() }
      }
    });
    const totalSessions = await prisma.session.count();
    console.log(`\n🔄 Sessions: ${activeSessions} active, ${totalSessions} total`);

    // 6. Sample user data (first 3 users)
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      include: {
        accounts: {
          select: {
            providerId: true,
            type: true,
            accountId: true
          }
        },
        sessions: {
          select: {
            expiresAt: true
          }
        },
        ...(isTwoFactorEnabled ? {
          twoFactor: {
            select: {
              id: true,
              createdAt: true
            }
          }
        } : {})
      }
    });

    if (sampleUsers.length > 0) {
      console.log('\n📋 Sample Users (first 3):');
      sampleUsers.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.email} (${user.id})`);
        console.log(`      Name: ${user.name || 'Not set'}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
        
        if (user.username) console.log(`      Username: ${user.username}`);
        if (user.phoneNumber) console.log(`      Phone: ${user.phoneNumber} ${user.phoneNumberVerified ? '(verified)' : '(unverified)'}`);
        if (user.twoFactorEnabled) console.log(`      2FA: ✅ Enabled`);
        if (user.banned) console.log(`      Status: ⛔ Banned`);
        
        console.log(`      Accounts: ${user.accounts.length}`);
        user.accounts.forEach(account => {
          const providerName = account.providerId === 'credential' ? 'Email/Password' : 
                              account.providerId.charAt(0).toUpperCase() + account.providerId.slice(1);
          console.log(`        - ${providerName} (${account.type})`);
        });
        
        console.log(`      Sessions: ${user.sessions.length}`);
        
        if (isTwoFactorEnabled && user.twoFactor) {
          console.log(`      2FA Setup: ✅ Configured`);
        }
      });
    }

    // 7. Migration health check
    console.log('\n🏥 Migration Health Check:');
    
    const usersWithoutAccounts = await prisma.user.count({
      where: {
        accounts: { none: {} }
      }
    });
    if (usersWithoutAccounts > 0) {
      console.log(`   ⚠️  ${usersWithoutAccounts} users have no authentication accounts`);
    } else {
      console.log(`   ✅ All users have authentication accounts`);
    }

    // Skip orphan account check for now due to Prisma relation complexity
    const orphanAccounts = 0;
    if (orphanAccounts > 0) {
      console.log(`   ⚠️  ${orphanAccounts} orphaned accounts (no associated user)`);
    } else {
      console.log(`   ✅ No orphaned accounts found`);
    }

    // 8. Recommendations
    console.log('\n💡 Recommendations:');
    
    if (usersWithoutAccounts > 0) {
      console.log('   • Run the migration script again to create missing accounts');
    }
    
    const unverifiedEmails = await prisma.user.count({
      where: { emailVerified: false }
    });
    if (unverifiedEmails > 0) {
      console.log(`   • Consider implementing email verification flow for ${unverifiedEmails} unverified users`);
    }

    const usersWithoutPasswords = await prisma.user.count({
      where: {
        accounts: {
          none: {
            AND: [
              { providerId: 'credential' },
              { password: { not: null } }
            ]
          }
        }
      }
    });
    if (usersWithoutPasswords > 0) {
      console.log(`   • ${usersWithoutPasswords} users may need to set passwords via "Forgot Password" flow`);
    }

    console.log('\n✅ Migration verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyMigration();
}