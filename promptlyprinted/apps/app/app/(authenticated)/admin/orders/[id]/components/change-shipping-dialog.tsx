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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Label } from '@repo/design-system/components/ui/label';
import { AlertCircle, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChangeShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  currentShippingMethod?: string;
  onSuccess: () => void;
}

const SHIPPING_COSTS: Record<string, number> = {
  BUDGET: 5.0,
  STANDARD: 10.0,
  EXPRESS: 20.0,
  OVERNIGHT: 35.0,
};

const SHIPPING_METHODS = [
  { value: 'Budget', label: 'Budget ($5.00)', cost: 5.0 },
  { value: 'Standard', label: 'Standard ($10.00)', cost: 10.0 },
  { value: 'Express', label: 'Express ($20.00)', cost: 20.0 },
  { value: 'Overnight', label: 'Overnight ($35.00)', cost: 35.0 },
];

export function ChangeShippingDialog({
  open,
  onOpenChange,
  orderId,
  currentShippingMethod,
  onSuccess,
}: ChangeShippingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newMethod, setNewMethod] = useState<string>('');

  const currentCost = currentShippingMethod
    ? SHIPPING_COSTS[currentShippingMethod.toUpperCase()] || 0
    : 0;
  const newCost = newMethod
    ? SHIPPING_COSTS[newMethod.toUpperCase()] || 0
    : 0;
  const refundAmount = currentCost - newCost;

  // Filter to only show cheaper methods (downgrades only)
  const availableMethods = SHIPPING_METHODS.filter(
    (method) => method.cost < currentCost
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMethod) {
      toast.error('Please select a shipping method');
      return;
    }

    if (newCost >= currentCost) {
      toast.error('You can only downgrade to a cheaper shipping method');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/update-shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shippingMethod: newMethod }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.details || data.error || 'Failed to update shipping method');
      }
    } catch (error) {
      console.error('Error updating shipping method:', error);
      toast.error('Failed to update shipping method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Shipping Method</DialogTitle>
          <DialogDescription>
            Select a slower (cheaper) shipping method. You cannot upgrade to faster shipping.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-blue-50 p-4">
              <h4 className="font-semibold text-sm">Current Shipping</h4>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Method:</dt>
                  <dd className="font-semibold">
                    {currentShippingMethod || 'Unknown'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cost:</dt>
                  <dd className="font-semibold">${currentCost.toFixed(2)}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingMethod">New Shipping Method</Label>
              <Select value={newMethod} onValueChange={setNewMethod}>
                <SelectTrigger id="shippingMethod">
                  <SelectValue placeholder="Select shipping method" />
                </SelectTrigger>
                <SelectContent>
                  {availableMethods.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No cheaper shipping methods available
                    </div>
                  ) : (
                    availableMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {newMethod && refundAmount > 0 && (
              <div className="rounded-md bg-green-50 p-4">
                <h4 className="flex items-center gap-2 font-semibold text-sm text-green-800">
                  <DollarSign className="h-4 w-4" />
                  Refund Details
                </h4>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Refund Amount:</dt>
                    <dd className="font-semibold text-green-700">
                      ${refundAmount.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Processing Time:</dt>
                    <dd className="text-green-700">5-10 business days</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm">
              <AlertCircle className="mr-2 inline h-4 w-4 text-yellow-600" />
              <span className="text-yellow-800">
                Upgrading to faster shipping is not supported. To upgrade, please cancel this order and place a new one.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !newMethod || availableMethods.length === 0}
            >
              {loading ? 'Updating...' : 'Update Shipping Method'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
