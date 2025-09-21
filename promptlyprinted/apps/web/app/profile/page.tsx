import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await import('next/headers').then(h => h.headers()) });
  if (!session?.user?.id) redirect('/sign-in');

  const dbUser = await database.user.findUnique({
    where: { id: session.user.id },
  });
  if (!dbUser)
    return <div className="container mx-auto p-4">User not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-semibold text-2xl">My Profile</h1>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {dbUser.firstName ?? ''}{' '}
          {dbUser.lastName ?? ''}
        </p>
        <p>
          <strong>Email:</strong> {dbUser.email}
        </p>
      </div>
    </div>
  );
}
