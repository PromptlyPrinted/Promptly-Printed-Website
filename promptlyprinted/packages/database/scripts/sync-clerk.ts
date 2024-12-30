import { Clerk } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { env } from '@repo/env';

const database = new PrismaClient();
const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });

async function syncClerkUsers() {
  try {
    console.log('Starting Clerk users sync...');
    
    // Get all users from Clerk
    const clerkUsers = await clerk.users.getUserList();
    
    console.log(`Found ${clerkUsers.length} users in Clerk`);

    // Create or update each user in the database
    for (const user of clerkUsers) {
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