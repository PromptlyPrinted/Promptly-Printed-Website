import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function PaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: parseInt(params.id),
    },
    include: {
      Order: true,
    },
  });

  if (!payment) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Payment Details</h1>
        <p className="text-muted-foreground">
          Details for payment ID: {payment.id}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="font-medium text-muted-foreground">ID</dt>
              <dd>{payment.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Stripe ID</dt>
              <dd>{payment.stripeId}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Status</dt>
              <dd>{payment.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Amount</dt>
              <dd>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: payment.currency,
                }).format(payment.amount)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Currency</dt>
              <dd>{payment.currency}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Created At</dt>
              <dd>{formatDate(payment.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {payment.Order.length > 0 && (
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Associated Orders</h2>
            <div className="space-y-4">
              {payment.Order.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {order.status}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-primary hover:underline"
                  >
                    View Order
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 