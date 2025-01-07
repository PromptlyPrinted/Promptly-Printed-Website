'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Label } from '@repo/design-system/components/ui/label';
import { format } from 'date-fns';
import { useToast } from '@repo/design-system/components/ui/use-toast';
import { useUser } from '@clerk/nextjs';
import useSWR from 'swr';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
};

async function getUser(id: string) {
  const response = await fetch(`/api/admin/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

async function updateUserRole(id: string, role: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }
  return response.json();
}

export default function UserDetailPage() {
  // Grab router, user, and param ID:
  const router = useRouter();
  const { user: currentUser, isLoaded } = useUser();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const { toast } = useToast();

  // Use the ID from useParams() in your SWR call
  const { data: user, isLoading, error, mutate } = useSWR<User>(
    isLoaded && id ? `/api/admin/users/${id}` : null,
    () => id ? getUser(id) : Promise.reject('No ID provided')
  );

  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not admin (adjust logic to your app’s needs)
  if (isLoaded && !currentUser) {
    router.push('/sign-in');
    return null;
  }

  const handleRoleChange = async (newRole: string) => {
    if (!id) {
      toast({
        title: 'Error',
        description: 'User ID is missing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUpdating(true);
      await updateUserRole(id, newRole);
      await mutate();
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="container mx-auto py-10">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        ← Back to Users
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <div className="mt-1">{user.email}</div>
            </div>
            <div>
              <Label>First Name</Label>
              <div className="mt-1">{user.firstName}</div>
            </div>
            <div>
              <Label>Last Name</Label>
              <div className="mt-1">{user.lastName}</div>
            </div>
            <div>
              <Label>Created At</Label>
              <div className="mt-1">{format(new Date(user.createdAt), 'PPP')}</div>
            </div>
            <div>
              <Label>Role</Label>
              <div className="mt-1">
                <Select
                  value={user.role}
                  onValueChange={handleRoleChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}