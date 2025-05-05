import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function MyDesignsPage() {
  const session = await auth();
  if (!session?.userId) {
    redirect('/sign-in');
  }
  const dbUser = await database.user.findUnique({ where: { clerkId: session.userId } });
  if (!dbUser) {
    return <div className="container mx-auto p-4">User not found</div>;
  }
  const designs = await database.design.findMany({
    where: { userId: dbUser.id },
    include: { savedImage: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Designs</h1>
      {designs.length === 0 ? (
        <p>You have no saved designs.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {designs.map(design => {
            const { savedImage } = design;
            return (
              <Link
                key={design.id}
                href={`/product/${design.productId}`}
                className="border rounded overflow-hidden p-2 block hover:shadow-lg"
              >
                <Image
                  src={savedImage.url}
                  alt={savedImage.name}
                  width={200}
                  height={200}
                  className="object-cover w-full h-48"
                />
                <p className="mt-2 text-center">{design.name}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
