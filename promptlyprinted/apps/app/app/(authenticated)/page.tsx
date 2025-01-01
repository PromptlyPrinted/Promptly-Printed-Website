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
import { Button } from "@repo/design-system/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { formatDistance } from "date-fns";
import { UsersIcon, ShoppingCartIcon, PackageIcon, CreditCardIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, DownloadIcon } from "lucide-react";
import { calculateMetrics } from '../lib/metrics';
import { generatePDFReport } from '../lib/generate-report';

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
  const [allOrders, allUsers] = await Promise.all([
    database.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    database.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    }),
  ]);

  const recentOrders = allOrders.slice(0, 5);
  const recentUsers = allUsers.slice(0, 5);
  const metrics = calculateMetrics(allOrders, allUsers);

  return {
    metrics,
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

  const { metrics, recentOrders, recentUsers } = await getOverviewData();

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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <form action="/api/reports/download" method="POST">
            <Button type="submit" variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </form>
        </div>

        {/* Period Metrics */}
        {(["daily", "weekly", "monthly"] as const).map((period) => (
          <div key={period} className="space-y-4">
            <h2 className="text-2xl font-bold capitalize">{period} Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <CreditCardIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sales</p>
                      <h3 className="text-2xl font-bold">${metrics.sales[period].current.toFixed(2)}</h3>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {metrics.sales[period].trend === "up" ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : metrics.sales[period].trend === "down" ? (
                      <TrendingDownIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <MinusIcon className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`ml-1 text-sm ${
                      metrics.sales[period].trend === "up" 
                        ? "text-green-500" 
                        : metrics.sales[period].trend === "down" 
                        ? "text-red-500" 
                        : "text-gray-500"
                    }`}>
                      {metrics.sales[period].percentageChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <ShoppingCartIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <h3 className="text-2xl font-bold">{metrics.orders[period].current}</h3>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {metrics.orders[period].trend === "up" ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : metrics.orders[period].trend === "down" ? (
                      <TrendingDownIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <MinusIcon className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`ml-1 text-sm ${
                      metrics.orders[period].trend === "up" 
                        ? "text-green-500" 
                        : metrics.orders[period].trend === "down" 
                        ? "text-red-500" 
                        : "text-gray-500"
                    }`}>
                      {metrics.orders[period].percentageChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <UsersIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Users</p>
                      <h3 className="text-2xl font-bold">{metrics.users[period].current}</h3>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {metrics.users[period].trend === "up" ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : metrics.users[period].trend === "down" ? (
                      <TrendingDownIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <MinusIcon className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`ml-1 text-sm ${
                      metrics.users[period].trend === "up" 
                        ? "text-green-500" 
                        : metrics.users[period].trend === "down" 
                        ? "text-red-500" 
                        : "text-gray-500"
                    }`}>
                      {metrics.users[period].percentageChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <PackageIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <h3 className="text-2xl font-bold">${metrics.averageOrderValue[period].current.toFixed(2)}</h3>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {metrics.averageOrderValue[period].trend === "up" ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : metrics.averageOrderValue[period].trend === "down" ? (
                      <TrendingDownIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <MinusIcon className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`ml-1 text-sm ${
                      metrics.averageOrderValue[period].trend === "up" 
                        ? "text-green-500" 
                        : metrics.averageOrderValue[period].trend === "down" 
                        ? "text-red-500" 
                        : "text-gray-500"
                    }`}>
                      {metrics.averageOrderValue[period].percentageChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ))}

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
