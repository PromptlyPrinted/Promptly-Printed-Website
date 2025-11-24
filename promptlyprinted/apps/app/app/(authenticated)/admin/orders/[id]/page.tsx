import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { headers } from 'next/headers';
import { Button } from '@repo/design-system/components/ui/button';
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
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import UpdateOrderStatus from './components/update-order-status';
import { OrderActions } from './components/order-actions';

async function getOrder(id: string) {
  const order = await database.order.findUnique({
    where: { id: Number.parseInt(id) },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      orderItems: true,
      recipient: true,
    },
  });

  if (!order) {
    redirect('/admin/orders');
  }

  return { order };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
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

  const { order } = await getOrder(id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-bold text-3xl">Order #{order.id}</h1>
      </div>

      {/* Order Actions */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Order Actions</h2>
        <OrderActions
          orderId={order.id}
          orderStatus={order.status}
          prodigiOrderId={order.prodigiOrderId}
          currentShippingMethod={order.shippingMethod || undefined}
          totalPrice={order.totalPrice}
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-xl">Order Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Status</dt>
              <dd>
                <UpdateOrderStatus
                  orderId={order.id}
                  currentStatus={order.status}
                />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Total Price</dt>
              <dd>${order.totalPrice.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Created</dt>
              <dd>
                {formatDistance(order.createdAt, new Date(), {
                  addSuffix: true,
                })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Customer Email</dt>
              <dd>{order.user.email}</dd>
            </div>
          </dl>
        </Card>

        {order.recipient && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-xl">Shipping Address</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Name</dt>
                <dd>{order.recipient.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Email</dt>
                <dd>{order.recipient.email || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Phone</dt>
                <dd>{order.recipient.phoneNumber || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Address</dt>
                <dd>
                  {order.recipient.addressLine1}
                  {order.recipient.addressLine2 && <br />}
                  {order.recipient.addressLine2}
                  <br />
                  {order.recipient.city}, {order.recipient.state}{' '}
                  {order.recipient.postalCode}
                  <br />
                  {order.recipient.countryCode}
                </dd>
              </div>
            </dl>
          </Card>
        )}
      </div>

      <Card>
        <h2 className="p-6 pb-0 font-semibold text-xl">Order Items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Copies</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.orderItems.map((item) => {
              const attrs = item.attributes as any;
              return (
                <TableRow key={item.id}>
                  <TableCell>{attrs?.productName || 'Product'}</TableCell>
                  <TableCell>{attrs?.sku || 'N/A'}</TableCell>
                  <TableCell>{item.copies}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>${(item.price * item.copies).toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
