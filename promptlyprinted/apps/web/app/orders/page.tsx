import { auth } from '@repo/auth/server';
import { prisma } from '@repo/database';
import { headers } from 'next/headers';
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
import { Package } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function getOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        totalPrice: true,
        status: true,
        shipments: {
          select: {
            trackingUrl: true,
          },
        },
        orderItems: {
          select: {
            id: true,
          },
        },
      },
    });
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export default async function CustomerOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const orders = await getOrders(session.user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">My Orders</h1>
          <p className="text-muted-foreground">
            View and manage your orders
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-semibold text-lg">No orders yet</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            When you place an order, it will appear here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistance(order.createdAt, new Date(), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${order.totalPrice.toFixed(2)}
                  </TableCell>
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
                    {order.shipments && order.shipments.length > 0 ? (
                      <a
                        href={order.shipments[0].trackingUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Track
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
