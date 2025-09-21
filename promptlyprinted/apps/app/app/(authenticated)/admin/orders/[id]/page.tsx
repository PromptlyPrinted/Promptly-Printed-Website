import { getProdigiProduct } from '@/lib/prodigi';
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

async function getOrder(id: string) {
  const order = await database.order.findUnique({
    where: { id: Number.parseInt(id) },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      orderItems: {
        include: {
          product: true,
        },
      },
      recipient: true,
    },
  });

  if (!order) {
    redirect('/admin/orders');
  }

  // If there's a Prodigi order ID, fetch the Prodigi order details
  let prodigiProduct = null;
  if (order.prodigiSku) {
    try {
      prodigiProduct = await getProdigiProduct(order.prodigiSku);
    } catch (error) {
      console.error('Error fetching Prodigi product:', error);
    }
  }

  return { order, prodigiProduct };
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

  const { order, prodigiProduct } = await getOrder(id);

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
            {order.prodigiSku && (
              <>
                <div className="flex justify-between">
                  <dt className="font-medium">Prodigi Product</dt>
                  <dd>
                    <a
                      href={`https://dashboard.prodigi.com/products/${order.prodigiSku}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Prodigi
                    </a>
                  </dd>
                </div>
                {prodigiProduct && (
                  <div className="flex justify-between">
                    <dt className="font-medium">Prodigi Product Status</dt>
                    <dd>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          prodigiProduct.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : prodigiProduct.status === 'inactive' ||
                                prodigiProduct.status === 'error'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {prodigiProduct.status.toUpperCase()}
                      </span>
                    </dd>
                  </div>
                )}
              </>
            )}
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
            {order.orderItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.product.sku}</TableCell>
                <TableCell>{item.copies}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>${(item.price * item.copies).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
