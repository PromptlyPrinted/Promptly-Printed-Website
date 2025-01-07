import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { notFound } from 'next/navigation';
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

export const metadata = {
  title: 'Webhooks - Admin Dashboard',
  description: 'View and manage webhook logs',
};

async function getWebhookLogs() {
  return database.webhookLog.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function WebhooksPage() {
  const { userId } = await auth();
  if (!userId) {
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

  const webhookLogs = await getWebhookLogs();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Webhook Logs</h1>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhookLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono">{log.id}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      log.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {log.status}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate">{log.response}</TableCell>
                <TableCell>
                  {formatDistance(log.createdAt, new Date(), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 