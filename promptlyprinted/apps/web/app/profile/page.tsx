import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.userId) redirect('/sign-in');

  const dbUser = await database.user.findUnique({ where: { clerkId: session.userId } });
  if (!dbUser) return <div className="container mx-auto p-4">User not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {dbUser.firstName ?? ''} {dbUser.lastName ?? ''}</p>
        <p><strong>Email:</strong> {dbUser.email}</p>
      </div>
    </div>
  );
}
