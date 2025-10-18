import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { MyImagesClient } from './my-images-client';

export default async function MyImagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  const dbUser = await database.user.findUnique({
    where: { id: session.user.id },
  });
  if (!dbUser) {
    return <div className="container mx-auto p-4">User not found</div>;
  }
  const images = await database.savedImage.findMany({
    where: {
      userId: dbUser.id,
      productId: null, // Only show images that were not saved as designs (no product context)
      url: {
        not: {
          startsWith: 'data:image' // Exclude old base64 images
        }
      }
    },
    select: {
      id: true,
      url: true,
      name: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Can increase now that we're excluding base64
  });

  return <MyImagesClient images={images} />;
}
