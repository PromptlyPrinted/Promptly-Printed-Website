import { auth } from '@repo/auth/server';
import { database as db } from '@repo/database';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Check if user exists in our database and has admin role
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/'); // Redirect non-admin users to home page
  }

  return true;
}
