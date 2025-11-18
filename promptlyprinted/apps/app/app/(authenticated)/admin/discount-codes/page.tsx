import { checkAdmin } from '@/lib/auth-utils';
import { database } from '@repo/database';
import { DiscountCodesClient } from './components/discount-codes-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DiscountCodesPage() {
  await checkAdmin();

  const discountCodes = await database.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { usages: true },
      },
    },
  });

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Discount Codes</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for your store
          </p>
        </div>
      </div>
      <DiscountCodesClient initialDiscountCodes={discountCodes} />
    </div>
  );
}
