import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function MyImagesPage() {
  const session = await auth();
  if (!session?.userId) {
    redirect('/sign-in');
  }
  const dbUser = await database.user.findUnique({ where: { clerkId: session.userId } });
  if (!dbUser) {
    return <div className="container mx-auto p-4">User not found</div>;
  }
  const images = await database.savedImage.findMany({ where: { userId: dbUser.id } });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Images</h1>
      {images.length === 0 ? (
        <p>You have no saved images.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="border rounded overflow-hidden p-2">
              <Image
                src={img.url}
                alt={img.name}
                width={200}
                height={200}
                className="object-cover w-full h-48"
              />
              <p className="mt-2 text-center">{img.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
