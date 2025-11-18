import { checkAdmin } from '@/lib/auth-utils';
import { database as db } from '@repo/database';
import { ProductsClient } from './components/products-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ITEMS_PER_PAGE = 50;
const DEFAULT_COUNTRY = 'GB';

// Supported countries with their currencies
const SUPPORTED_COUNTRIES = [
  { code: 'US', currency: 'USD' },
  { code: 'GB', currency: 'GBP' },
  { code: 'DE', currency: 'EUR' },
  { code: 'AU', currency: 'AUD' },
  { code: 'FR', currency: 'EUR' },
  { code: 'CH', currency: 'CHF' },
  { code: 'SE', currency: 'SEK' },
  { code: 'AE', currency: 'AED' },
  { code: 'ES', currency: 'EUR' },
  { code: 'IT', currency: 'EUR' },
  { code: 'NL', currency: 'EUR' },
  { code: 'DK', currency: 'DKK' },
  { code: 'NO', currency: 'NOK' },
  { code: 'NZ', currency: 'NZD' },
  { code: 'IE', currency: 'EUR' },
  { code: 'KR', currency: 'KRW' },
  { code: 'JP', currency: 'JPY' },
  { code: 'BE', currency: 'EUR' },
  { code: 'SG', currency: 'SGD' },
  { code: 'CN', currency: 'CNY' },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    country?: string;
    search?: string;
    category?: string;
    type?: string;
    listed?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  await checkAdmin();

  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const countryCode = resolvedSearchParams?.country || DEFAULT_COUNTRY;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Ensure the country code is in the supported list or "all"
  if (
    countryCode !== 'all' &&
    !SUPPORTED_COUNTRIES.find((c) => c.code === countryCode)
  ) {
    throw new Error(`Unsupported country code: ${countryCode}`);
  }

  // Build where clause based on filters
  const where: any = {};

  if (countryCode !== 'all') {
    where.countryCode = countryCode;
  }

  if (resolvedSearchParams?.search) {
    where.OR = [
      { name: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { sku: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
    ];
  }

  if (resolvedSearchParams?.category) {
    where.category = {
      name: resolvedSearchParams.category,
    };
  }

  if (resolvedSearchParams?.type) {
    where.productType = resolvedSearchParams.type;
  }

  if (resolvedSearchParams?.listed) {
    where.listed = resolvedSearchParams.listed === 'listed';
  }

  if (resolvedSearchParams?.minPrice || resolvedSearchParams?.maxPrice) {
    where.customerPrice = {};
    if (resolvedSearchParams?.minPrice) {
      where.customerPrice.gte = Number.parseFloat(resolvedSearchParams.minPrice);
    }
    if (resolvedSearchParams?.maxPrice) {
      where.customerPrice.lte = Number.parseFloat(resolvedSearchParams.maxPrice);
    }
  }

  const [products, categories, totalProducts] = await Promise.all([
    db.product.findMany({
      where,
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
        isActive: true,
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
        createdAt: 'desc',
      },
    }),
    db.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
      </div>
      <ProductsClient
        initialProducts={products}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        countries={SUPPORTED_COUNTRIES.map((c) => c.code)}
        selectedCountry={countryCode}
      />
    </div>
  );
}
