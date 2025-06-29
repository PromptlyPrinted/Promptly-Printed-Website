import { Clerk } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const database = new PrismaClient();
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// List of admin email addresses
const ADMIN_EMAILS = [
  'nathan@promptlyprinted.com',
  'kingfame@hotmail.co.uk',
  'flackomge@gmail.com',
  'checastro@hotmail.co.uk',
];

async function syncClerkUsers() {
  try {
    console.log('Starting Clerk users sync...');

    // Get all users from Clerk
    const clerkUsers = await clerk.users.getUserList();

    console.log(`Found ${clerkUsers.length} users in Clerk`);

    // Create or update each user in the database
    for (const user of clerkUsers) {
      const email = user.emailAddresses[0]?.emailAddress ?? '';
      const isAdmin = ADMIN_EMAILS.includes(email);

      await database.user.upsert({
        where: { clerkId: user.id },
        create: {
          clerkId: user.id,
          email: email,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        },
        update: {
          email: email,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        },
      });

      console.log(
        `Updated user ${email} with role: ${isAdmin ? 'ADMIN' : 'CUSTOMER'}`
      );
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
