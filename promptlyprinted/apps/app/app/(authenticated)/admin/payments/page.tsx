import { prisma } from '@/lib/prisma';
import { PaymentsTable } from './components/payments-table';

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-bold text-2xl tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Manage and view payment records</p>
      </div>
      <PaymentsTable payments={payments} />
    </div>
  );
}
