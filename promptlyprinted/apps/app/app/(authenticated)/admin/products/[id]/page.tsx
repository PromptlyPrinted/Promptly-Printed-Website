import { checkAdmin } from '@/lib/auth-utils';
import { database as db } from '@repo/database';
import { notFound } from 'next/navigation';
import { ProductForm } from '../components/product-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  await checkAdmin();

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: {
        id: Number.parseInt(params.id),
      },
      include: {
        quotes: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            costSummary: {
              include: {
                shipping: true,
              },
            },
          },
        },
      },
    }),
    db.category.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl tracking-tight">Edit Product</h2>
      </div>
      <div className="grid gap-4">
        <ProductForm initialData={product} categories={categories} />
      </div>
    </div>
  );
}
