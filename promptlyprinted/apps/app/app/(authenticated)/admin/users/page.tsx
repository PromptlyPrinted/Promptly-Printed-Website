'use client';

import { DataTable } from '@/components/ui/data-table';
import { useSession } from '@repo/auth/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useUserFilterStore } from '../../components/sidebar';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
};

async function getUsers() {
  const response = await fetch('/api/admin/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export default function UsersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const currentUser = session?.user;
  const isLoaded = !isPending;
  const { roleFilter, setRoleFilter } = useUserFilterStore();
  const {
    data: users,
    isLoading,
    error,
  } = useSWR<User[]>(isLoaded ? '/api/admin/users' : null, getUsers);

  // Redirect if not admin
  if (isLoaded && !currentUser) {
    router.push('/sign-in');
    return null;
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'PPP'),
    },
  ];

  const filteredUsers =
    users?.filter((user) =>
      roleFilter === 'ALL' ? true : user.role === roleFilter
    ) ?? [];

  if (!isLoaded || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <div className="flex items-center space-x-4">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                <SelectItem value="ADMIN">Admins Only</SelectItem>
                <SelectItem value="CUSTOMER">Customers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredUsers}
            onRowClick={(row) => router.push(`/admin/users/${row.original.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
