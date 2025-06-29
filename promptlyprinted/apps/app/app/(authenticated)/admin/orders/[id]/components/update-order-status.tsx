'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface UpdateOrderStatusProps {
  orderId: number;
  currentStatus: 'PENDING' | 'COMPLETED' | 'CANCELED';
}

export default function UpdateOrderStatus({
  orderId,
  currentStatus,
}: UpdateOrderStatusProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setStatus(newStatus as 'PENDING' | 'COMPLETED' | 'CANCELED');
      toast.success('Order status updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {status}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
            PENDING
          </span>
        </SelectItem>
        <SelectItem value="COMPLETED">
          <span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
            COMPLETED
          </span>
        </SelectItem>
        <SelectItem value="CANCELED">
          <span className="rounded-full bg-red-100 px-2 py-1 text-red-800 text-xs">
            CANCELED
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
