'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  totalPrice: number;
  onSuccess: () => void;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderId,
  totalPrice,
  onSuccess,
}: CancelOrderDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.details || data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancel Order #{orderId}
          </DialogTitle>
          <DialogDescription>
            This action will cancel the order and process a full refund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-red-50 p-4">
            <h4 className="font-semibold text-sm">Refund Details</h4>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Refund Amount:</dt>
                <dd className="font-semibold">${totalPrice.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Processing Time:</dt>
                <dd>5-10 business days</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm">
            <p className="font-semibold text-yellow-800">Important:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-yellow-700">
              <li>The Prodigi print order will be cancelled immediately</li>
              <li>The customer will receive a full refund to their original payment method</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Order & Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
