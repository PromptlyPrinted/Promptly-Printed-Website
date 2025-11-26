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
import {
  CreditCardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
} from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getOverviewData() {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalSales,
    recentOrders,
    recentUsers,
  ] = await Promise.all([
    database.user.count(),
    database.order.count(),
    database.product.count(),
    database.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: 'COMPLETED',
      },
    }),
    database.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
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
    }),
    database.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalSales: totalSales._sum.totalPrice || 0,
    },
    recentOrders,
    recentUsers,
  };
}

export default async function AdminOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect('/sign-in');

  // Verify admin status
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/');
  }

  const { stats, recentOrders, recentUsers } = await getOverviewData();

  return (
    <div className="container mx-auto space-y-8 p-6">
      <h1 className="font-bold text-3xl">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-blue-100 p-2">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Users</p>
              <h3 className="font-bold text-2xl">{stats.totalUsers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-green-100 p-2">
              <ShoppingCartIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <h3 className="font-bold text-2xl">{stats.totalOrders}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-purple-100 p-2">
              <PackageIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Products</p>
              <h3 className="font-bold text-2xl">{stats.totalProducts}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-yellow-100 p-2">
              <CreditCardIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Sales</p>
              <h3 className="font-bold text-2xl">
                ${stats.totalSales.toFixed(2)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <h2 className="font-bold text-2xl">Recent Orders</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Recent Users */}
      <div className="space-y-4">
        <h2 className="font-bold text-2xl">Recent Users</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {formatDistance(user.createdAt, new Date(), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
