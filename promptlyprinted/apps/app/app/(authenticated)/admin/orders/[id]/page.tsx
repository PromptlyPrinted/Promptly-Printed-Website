import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { database } from "@repo/database";
import { Card } from "@repo/design-system/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { formatDistance } from "date-fns";
import { Button } from "@repo/design-system/components/ui/button";
import { ChevronLeft } from "lucide-react";
import UpdateOrderStatus from "./components/update-order-status";
import { getProdigiClient } from "@/lib/prodigi";

async function getOrder(id: string) {
  const order = await database.order.findUnique({
    where: { id: parseInt(id) },
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
    redirect("/admin/orders");
  }

  // If there's a Prodigi order ID, fetch the Prodigi order details
  let prodigiOrder = null;
  if (order.prodigiOrderId) {
    const prodigiClient = getProdigiClient();
    if (prodigiClient) {
      try {
        prodigiOrder = await prodigiClient.getOrder(order.prodigiOrderId);
      } catch (error) {
        console.error("Error fetching Prodigi order:", error);
      }
    }
  }

  return { order, prodigiOrder };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Verify admin status
  const user = await database.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const { order, prodigiOrder } = await getOrder(params.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Status</dt>
              <dd>
                <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Total Price</dt>
              <dd>${order.totalPrice.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Created</dt>
              <dd>{formatDistance(order.createdAt, new Date(), { addSuffix: true })}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Customer Email</dt>
              <dd>{order.user.email}</dd>
            </div>
            {order.prodigiOrderId && (
              <>
                <div className="flex justify-between">
                  <dt className="font-medium">Prodigi Order</dt>
                  <dd>
                    <a
                      href={`https://dashboard.prodigi.com/orders/${order.prodigiOrderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Prodigi
                    </a>
                  </dd>
                </div>
                {prodigiOrder && (
                  <div className="flex justify-between">
                    <dt className="font-medium">Prodigi Status</dt>
                    <dd>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          prodigiOrder.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : prodigiOrder.status === "cancelled" || prodigiOrder.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {prodigiOrder.status.toUpperCase()}
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
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Name</dt>
                <dd>{order.recipient.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Email</dt>
                <dd>{order.recipient.email || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Phone</dt>
                <dd>{order.recipient.phoneNumber || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Address</dt>
                <dd>
                  {order.recipient.addressLine1}
                  {order.recipient.addressLine2 && <br />}
                  {order.recipient.addressLine2}
                  <br />
                  {order.recipient.city}, {order.recipient.state} {order.recipient.postalCode}
                  <br />
                  {order.recipient.countryCode}
                </dd>
              </div>
            </dl>
          </Card>
        )}
      </div>

      <Card>
        <h2 className="text-xl font-semibold p-6 pb-0">Order Items</h2>
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