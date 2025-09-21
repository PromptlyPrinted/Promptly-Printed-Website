import { DesignCard } from '@/components/design-card';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Designs | Promptly Printed',
  description: 'View and manage your saved designs',
};

export default async function DesignsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const designs = await database.savedImage.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          name: true,
          sku: true,
          color: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container py-8">
      <h1 className="mb-8 font-bold text-4xl">My Designs</h1>
      {designs.length === 0 ? (
        <div className="py-12 text-center">
          <h2 className="mb-2 font-medium text-gray-900 text-xl">
            No designs yet
          </h2>
          <p className="text-gray-500">
            Start customizing products to create and save your designs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}
