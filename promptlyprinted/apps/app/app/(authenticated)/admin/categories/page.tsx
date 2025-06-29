import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { CategoriesClient } from './components/categories-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.userId) redirect('/sign-in');

  // Verify admin status
  const user = await database.user.findUnique({
    where: { clerkId: session.userId },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch categories with product counts
  const categories = await database.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl tracking-tight">Categories</h2>
      </div>
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
