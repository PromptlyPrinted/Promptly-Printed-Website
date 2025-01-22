import { Suspense } from "react";
import { ProductsClient } from "./components/products-client";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { checkAdmin } from "@/lib/auth-utils";
import { database as db } from "@repo/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ITEMS_PER_PAGE = 50;
const DEFAULT_COUNTRY = "GB"; // or whatever your default country should be

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { 
    page?: string;
    country?: string;
  };
}) {
  await checkAdmin();

  const currentPage = Number(searchParams?.page) || 1;
  const countryCode = searchParams?.country || DEFAULT_COUNTRY;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [products, categories, totalProducts] = await Promise.all([
    db.product.findMany({
      where: {
        countryCode: countryCode,
      },
      take: ITEMS_PER_PAGE,
      skip,
      select: {
        id: true,
        name: true,
        sku: true,
        customerPrice: true,
        shippingCost: true,
        currency: true,
        stock: true,
        listed: true,
        productType: true,
        categoryId: true,
        countryCode: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          take: 1,
          select: {
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    db.product.count({
      where: {
        countryCode: countryCode,
      },
    }),
  ]);

  // Get unique country codes for the country selector
  const countries = await db.product.findMany({
    distinct: ['countryCode'],
    select: {
      countryCode: true,
    },
  });
  
  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-[calc(100vh-12rem)]" />}>
        <ProductsClient 
          initialProducts={products} 
          categories={categories}
          currentPage={currentPage}
          totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
          countries={countries.map(c => c.countryCode).filter(Boolean)}
          selectedCountry={countryCode}
        />
      </Suspense>
    </div>
  );
}