#!/usr/bin/env node

/**
 * Migration script to add Better Auth credential accounts for existing Clerk users
 * This creates the Account records needed for email/password authentication
 */

const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@6.5.0_prisma@6.5.0_typescript@5.8.3/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function migrateExistingUsers() {
  console.log('🔄 Starting migration of existing users to Better Auth...');

  try {
    // Get all users who don't have credential accounts
    const usersWithoutCredentialAccounts = await prisma.user.findMany({
      where: {
        accounts: {
          none: {
            type: 'email',
            provider: 'credential'
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${usersWithoutCredentialAccounts.length} users without credential accounts`);

    if (usersWithoutCredentialAccounts.length === 0) {
      console.log('✅ All users already have credential accounts');
      return;
    }

    // Create credential accounts for each user
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutCredentialAccounts) {
      try {
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'email',
            provider: 'credential',
            providerAccountId: user.email, // Use email as the provider account ID
            // Better Auth will handle password hashing when user sets/resets password
          }
        });

        console.log(`✅ Created credential account for: ${user.email}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create account for ${user.email}:`, error);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Failed migrations: ${errorCount} users`);
    console.log(`📊 Total processed: ${usersWithoutCredentialAccounts.length} users`);

    if (successCount > 0) {
      console.log('\n🔐 Important Notes:');
      console.log('• Migrated users will need to reset their passwords');
      console.log('• Consider sending password reset emails to migrated users');
      console.log('• Users can use the "Forgot Password" flow to set new passwords');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateExistingUsers()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });