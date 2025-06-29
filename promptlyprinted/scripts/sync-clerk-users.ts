import { clerkClient } from '@repo/auth/server';
import { database } from '@repo/database';

async function syncClerkUsers() {
  try {
    console.log('Starting Clerk users sync...');

    // Get all users from Clerk
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList();

    console.log(`Found ${users.data.length} users in Clerk`);

    // Create or update each user in the database
    for (const user of users.data) {
      await database.user.upsert({
        where: { clerkId: user.id },
        create: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? '',
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
        },
        update: {
          email: user.emailAddresses[0]?.emailAddress ?? '',
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
        },
      });
    }

    console.log('Successfully synced all users');
  } catch (error) {
    console.error('Error syncing users:', error);
    process.exit(1);
  }
}

// Run the sync
syncClerkUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
