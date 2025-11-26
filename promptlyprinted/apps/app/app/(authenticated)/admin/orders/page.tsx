import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { Card } from '@repo/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { formatDistance } from 'date-fns';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function getOrders() {
  const orders = await database.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      recipient: {
        select: {
          email: true,
        },
      },
    },
  });

  return orders;
}

export default async function AdminOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Verify admin status
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/');
  }

  const orders = await getOrders();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl">Orders</h1>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Prodigi Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    #{order.id}
                  </Link>
                </TableCell>
                <TableCell>{order.user?.email || order.recipient?.email || 'Guest'}</TableCell>
                <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      order.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDistance(order.createdAt, new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {order.prodigiOrderId ? (
                    <a
                      href={`https://dashboard.prodigi.com/orders/${order.prodigiOrderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Prodigi
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
