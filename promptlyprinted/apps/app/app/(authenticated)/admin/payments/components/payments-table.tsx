'use client';

import { DataTable } from '@/components/ui/data-table';
import { formatDate } from '@/lib/utils';
import type { Payment } from '@prisma/client';

const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'stripeId',
    header: 'Stripe ID',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }: { row: any }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: row.original.currency,
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }: { row: any }) => formatDate(row.getValue('createdAt')),
  },
];

interface PaymentsTableProps {
  payments: Payment[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return <DataTable columns={columns} data={payments} />;
}
