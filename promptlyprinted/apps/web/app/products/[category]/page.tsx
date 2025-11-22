import { ProductGrid } from '@/app/components/products/ProductGrid';
import { database } from '@repo/database';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryName = category.replace(/-/g, ' ');
  return createMetadata({
    title: `${categoryName} | Products | Promptly Printed`,
    description: `Explore our range of ${categoryName}.`,
  });
}

async function getProductsByCategory(categoryName: string) {
  const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedCategoryName = normalizeString(categoryName);

  // Fetch all listed and active products from the database
  const allProducts = await database.product.findMany({
    where: {
      listed: true,
      isActive: true,
      countryCode: 'US',
    },
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Filter to show only parent products (not variants)
  const parentProducts = allProducts.filter(
    (p) => p.isVariantProduct || (!p.parentProductId && !p.isVariantProduct)
  );

  // Filter by category name
  const filteredProducts = parentProducts.filter((product) => {
    const productCategoryName = product.category?.name || '';
    return normalizeString(productCategoryName) === normalizedCategoryName;
  });

  // Map to the format expected by ProductGrid
  return filteredProducts.map((product) => {
    const prodigiVariants = product.prodigiVariants as Record<string, any> | null;
    const imageUrls = prodigiVariants?.imageUrls as Record<string, string> | undefined;

    return {
      id: product.sku,
      sku: product.sku,
      name: product.name,
      price: product.customerPrice || product.price,
      description: product.description || '',
      shippingCost: product.shippingCost,
      savedImages: [],
      wishedBy: [],
      category: product.category
        ? {
            id: product.category.id.toString(),
            name: product.category.name,
          }
        : undefined,
      imageUrls: {
        base: imageUrls?.base || '',
        cover:
          imageUrls?.productImage ||
          imageUrls?.cover ||
          (imageUrls?.base ? `${imageUrls.base}/cover.png` : ''),
        sizeChart: imageUrls?.sizeChart || '',
      },
      specifications: {
        dimensions: {
          width: product.width,
          height: product.height,
          units: product.units,
        },
        brand: product.brand,
        style: product.style,
        color: product.color,
        size: product.size,
      },
      prodigiVariants,
    };
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryName = category.replace(/-/g, ' ');

  const products = await getProductsByCategory(categoryName);

  return (
    <div className="container mx-auto py-20">
      <h1 className="mb-8 font-bold text-4xl tracking-tight">{categoryName}</h1>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <ProductGrid products={products as any} />
      )}
    </div>
  );
}