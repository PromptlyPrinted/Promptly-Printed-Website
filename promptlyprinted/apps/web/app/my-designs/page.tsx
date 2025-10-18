import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { MyDesignsClient } from './my-designs-client';

export default async function MyDesignsPage() {
  const session = await auth.api.getSession({ headers: await import('next/headers').then(h => h.headers()) });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  const dbUser = await database.user.findUnique({
    where: { id: session.user.id },
  });
  if (!dbUser) {
    return <div className="container mx-auto p-4">User not found</div>;
  }
  const designs = await database.savedImage.findMany({
    where: {
      userId: dbUser.id,
      productId: { not: null } // Only show images that were saved as designs (with product context)
    },
    include: {
      product: {
        select: {
          name: true,
          sku: true,
          color: true,
          category: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return <MyDesignsClient designs={designs} />;
}
