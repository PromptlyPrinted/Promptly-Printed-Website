import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function MyImagesPage() {
  const session = await auth();
  if (!session?.userId) {
    redirect('/sign-in');
  }
  const dbUser = await database.user.findUnique({
    where: { clerkId: session.userId },
  });
  if (!dbUser) {
    return <div className="container mx-auto p-4">User not found</div>;
  }
  const images = await database.savedImage.findMany({
    where: { userId: dbUser.id },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-semibold text-2xl">My Images</h1>
      {images.length === 0 ? (
        <p>You have no saved images.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded border p-2">
              <Image
                src={img.url}
                alt={img.name}
                width={200}
                height={200}
                className="h-48 w-full object-cover"
              />
              <p className="mt-2 text-center">{img.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
