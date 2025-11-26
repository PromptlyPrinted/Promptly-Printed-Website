import { auth } from '@repo/auth/server';
import { prisma } from '@repo/database';
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
import { ChevronLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CustomerOrderActions } from './components/customer-order-actions';
import { OrderStatusTracker } from './components/order-status-tracker';

async function getOrder(id: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: Number.parseInt(id),
      userId: userId, // Ensure user can only see their own orders
    },
    select: {
      id: true,
      createdAt: true,
      totalPrice: true,
      status: true,
      prodigiOrderId: true,
      prodigiStage: true,
      shippingMethod: true,
      metadata: true,
      recipient: true,
      shipments: true,
      orderItems: {
        select: {
          id: true,
          copies: true,
          price: true,
          attributes: true,
        },
      },
    },
  });

  if (!order) {
    redirect('/orders');
  }

  return order;
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/sign-in');
  }

  const order = await getOrder(id, session.user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-3xl">Order #{order.id}</h1>
          <p className="text-muted-foreground text-sm">
            Placed {formatDistance(order.createdAt, new Date(), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Order Status Tracker */}
      {order.prodigiOrderId && (
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-xl">Order Status</h2>
          <OrderStatusTracker
            prodigiOrderId={order.prodigiOrderId}
            status={order.status}
            prodigiStage={order.prodigiStage || undefined}
          />
        </Card>
      )}

      {/* Error Display */}
      {(order.metadata as any)?.prodigiError && (
        <Card className="border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 font-semibold text-red-900 text-xl">Order Processing Issue</h2>
          <p className="text-red-700">
            There was an issue sending your order to the printer:
          </p>
          <p className="mt-2 font-mono text-red-800 text-sm bg-red-100 p-2 rounded">
            {(order.metadata as any).prodigiError}
          </p>
          <p className="mt-4 text-red-700 text-sm">
            Please contact support with your Order ID #{order.id}.
          </p>
        </Card>
      )}

      {/* Order Actions */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Manage Your Order</h2>
        <CustomerOrderActions
          orderId={order.id}
          orderStatus={order.status}
          prodigiOrderId={order.prodigiOrderId}
          currentShippingMethod={order.shippingMethod || undefined}
          totalPrice={order.totalPrice}
          orderCreatedAt={order.createdAt}
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Order Summary */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-xl">Order Summary</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Status</dt>
              <dd>
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
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Total</dt>
              <dd className="font-semibold">${order.totalPrice.toFixed(2)}</dd>
            </div>
            {order.shippingMethod && (
              <div className="flex justify-between">
                <dt className="font-medium">Shipping</dt>
                <dd>{order.shippingMethod}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Shipping Address */}
        {order.recipient && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-xl">Shipping To</h2>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{order.recipient.name}</p>
              {order.recipient.email && (
                <p className="text-muted-foreground">{order.recipient.email}</p>
              )}
              <p className="mt-2">{order.recipient.addressLine1}</p>
              {order.recipient.addressLine2 && <p>{order.recipient.addressLine2}</p>}
              <p>
                {order.recipient.city}
                {order.recipient.state && `, ${order.recipient.state}`} {order.recipient.postalCode}
              </p>
              <p>{order.recipient.countryCode}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Tracking Information */}
      {order.shipments && order.shipments.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-xl">Tracking Information</h2>
          <div className="space-y-4">
            {order.shipments.map((shipment) => (
              <div key={shipment.id} className="rounded-md border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {shipment.carrier} - {shipment.carrierService}
                    </p>
                    {shipment.trackingNumber && (
                      <p className="font-mono text-muted-foreground text-sm">
                        {shipment.trackingNumber}
                      </p>
                    )}
                    {shipment.dispatchDate && (
                      <p className="text-muted-foreground text-xs">
                        Shipped {formatDistance(shipment.dispatchDate, new Date(), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  {shipment.trackingUrl && (
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Track Package
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <h2 className="p-6 pb-0 font-semibold text-xl">Your Items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.orderItems.map((item) => {
              const attrs = item.attributes as any;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{attrs?.productName || 'Product'}</p>
                        {attrs?.sku && (
                          <p className="text-muted-foreground text-xs">SKU: {attrs.sku}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.copies}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">
                    ${(item.price * item.copies).toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
