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
import { env } from '@repo/env';

export const metadata = {
  title: 'Settings - Admin Dashboard',
  description: 'View system settings and configuration',
};

// Function to safely display sensitive values
function maskValue(value: string | undefined): string {
  if (!value) return 'Not set';
  if (value.length <= 8) return '••••••••';
  return value.slice(0, 4) + '•'.repeat(8) + value.slice(-4);
}

// Function to check if an environment variable exists
function getEnvStatus(value: string | undefined): { status: string; color: string } {
  if (!value) {
    return { status: 'Not Configured', color: 'bg-red-100 text-red-800' };
  }
  return { status: 'Configured', color: 'bg-green-100 text-green-800' };
}

export default async function SettingsPage() {
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

  // Define environment variables to display
  const envVariables = [
    { name: 'DATABASE_URL', value: env.DATABASE_URL, isSensitive: true },
    { name: 'SVIX_TOKEN', value: process.env.SVIX_TOKEN, isSensitive: true },
    { name: 'FLAGS_SECRET', value: process.env.FLAGS_SECRET, isSensitive: true },
    { name: 'BASEHUB_TOKEN', value: process.env.BASEHUB_TOKEN, isSensitive: true },
    { name: 'NODE_ENV', value: process.env.NODE_ENV, isSensitive: false },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Environment Variable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {envVariables.map((variable) => {
              const status = getEnvStatus(variable.value);
              return (
                <TableRow key={variable.name}>
                  <TableCell className="font-mono">{variable.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                      {status.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {variable.isSensitive ? (
                      <code className="px-2 py-1 bg-gray-100 rounded">
                        {maskValue(variable.value)}
                      </code>
                    ) : (
                      <code className="px-2 py-1 bg-gray-100 rounded">
                        {variable.value || 'Not set'}
                      </code>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="text-sm text-gray-500">
        <p>Note: Sensitive values are partially masked for security reasons.</p>
      </div>
    </div>
  );
} 