import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyDesignsPage() {
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
  const designs = await database.design.findMany({
    where: { userId: dbUser.id },
    include: { savedImage: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-semibold text-2xl">My Designs</h1>
      {designs.length === 0 ? (
        <p>You have no saved designs.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {designs.map((design) => {
            const { savedImage } = design;
            return (
              <Link
                key={design.id}
                href={`/product/${design.productId}`}
                className="block overflow-hidden rounded border p-2 hover:shadow-lg"
              >
                <Image
                  src={savedImage.url}
                  alt={savedImage.name}
                  width={200}
                  height={200}
                  className="h-48 w-full object-cover"
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
