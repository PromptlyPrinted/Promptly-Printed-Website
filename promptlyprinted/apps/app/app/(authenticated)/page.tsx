import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { env } from '@repo/env';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
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
import { UsersIcon, ShoppingCartIcon, PackageIcon, CreditCardIcon } from "lucide-react";

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

const title = 'Promptly Printed Admin';
const description = 'Admin dashboard.';

export const metadata: Metadata = {
  title,
  description,
};

async function getOverviewData() {
  const [totalUsers, totalOrders, totalProducts, totalSales, recentOrders, recentUsers] =
    await Promise.all([
      database.user.count(),
      database.order.count(),
      database.product.count(),
      database.order.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          status: "COMPLETED",
        },
      }),
      database.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      database.user.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
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

const App = async () => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    notFound();
  }

  // Verify admin status
  const user = await database.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    notFound();
  }

  const { stats, recentOrders, recentUsers } = await getOverviewData();

  return (
    <>
      <Header pages={['Admin Dashboard']} page="Overview">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingCartIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <PackageIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <CreditCardIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <h3 className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
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
                    <TableCell>{order.user.email}</TableCell>
                    <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDistance(order.createdAt, new Date(), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Recent Users */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Users</h2>
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
                      {formatDistance(user.createdAt, new Date(), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
};

export default App;
