import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.userId) redirect('/sign-in');

  const dbUser = await database.user.findUnique({
    where: { clerkId: session.userId },
  });
  if (!dbUser)
    return <div className="container mx-auto p-4">User not found</div>;

  const orders = await database.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-semibold text-2xl">My Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded border p-4">
              <p>
                <strong>Order #{order.id}</strong>
              </p>
              <p>Status: {order.status}</p>
              <p>Total: ${order.totalPrice.toFixed(2)}</p>
              <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
