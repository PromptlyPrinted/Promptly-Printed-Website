'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/design-system/components/ui/tooltip';
import { AlertCircle, Ban, Edit, Truck, CheckCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CancelOrderDialog } from './cancel-order-dialog';
import { EditAddressDialog } from './edit-address-dialog';
import { ChangeShippingDialog } from './change-shipping-dialog';

interface CustomerOrderActionsProps {
  orderId: number;
  orderStatus: string;
  prodigiOrderId: string | null;
  currentShippingMethod?: string;
  totalPrice: number;
  orderCreatedAt: Date;
}

interface ActionAvailability {
  cancel?: {
    isAvailable: 'Yes' | 'No';
    reason?: string;
  };
  changeRecipientDetails?: {
    isAvailable: 'Yes' | 'No';
    reason?: string;
  };
  changeShippingMethod?: {
    isAvailable: 'Yes' | 'No';
    reason?: string;
  };
}

export function CustomerOrderActions({
  orderId,
  orderStatus,
  prodigiOrderId,
  currentShippingMethod,
  totalPrice,
  orderCreatedAt,
}: CustomerOrderActionsProps) {
  const [actions, setActions] = useState<ActionAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditAddressDialog, setShowEditAddressDialog] = useState(false);
  const [showChangeShippingDialog, setShowChangeShippingDialog] = useState(false);

  // Check 2-hour cancellation window (can only cancel WITHIN first 2 hours)
  const now = new Date();
  const createdAt = new Date(orderCreatedAt);
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const canCancelBasedOnTime = hoursSinceCreation < 2;
  const minutesRemaining = Math.ceil((2 - hoursSinceCreation) * 60);
  const hoursRemaining = (2 - hoursSinceCreation).toFixed(1);

  useEffect(() => {
    loadActions();
  }, [orderId]);

  const loadActions = async () => {
    if (!prodigiOrderId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/actions`);
      const data = await response.json();

      if (response.ok) {
        setActions(data.actions);
      } else {
        console.error('Failed to load actions:', data);
      }
    } catch (error) {
      console.error('Error loading actions:', error);
      toast.error('Failed to check available actions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 animate-spin" />
        Checking what you can do with this order...
      </div>
    );
  }

  if (!prodigiOrderId) {
    return (
      <div className="rounded-md bg-blue-50 p-4 text-sm">
        <p className="font-semibold text-blue-900">Order is being processed</p>
        <p className="mt-1 text-blue-700">
          Your order is being prepared. You'll be able to track it soon!
        </p>
      </div>
    );
  }

  if (orderStatus === 'CANCELED') {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Order Cancelled</p>
            <p className="mt-1 text-red-700 text-sm">
              This order has been cancelled. Your refund will be processed within 5-10 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canCancelFromProdigi = actions?.cancel?.isAvailable === 'Yes';
  const canCancel = canCancelFromProdigi && canCancelBasedOnTime;
  const canEditAddress = actions?.changeRecipientDetails?.isAvailable === 'Yes';
  const canChangeShipping = actions?.changeShippingMethod?.isAvailable === 'Yes';

  const hasAnyActions = canCancel || canEditAddress || canChangeShipping;

  if (!hasAnyActions) {
    return (
      <div className="rounded-md bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900 text-sm">Order is being printed!</p>
            <p className="mt-1 text-green-700 text-sm">
              Your order is in production and will ship soon. Changes are no longer possible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-blue-50 p-4 text-sm">
        <p className="font-semibold text-blue-900">You can still make changes!</p>
        <p className="mt-1 text-blue-700">
          Your order hasn't started printing yet. You can {canCancel ? 'cancel, ' : ''}fix your address{canChangeShipping ? ', or change shipping speed' : ''}.
        </p>
      </div>

      {/* Show 2-hour restriction notice if cancellation window has expired */}
      {canCancelFromProdigi && !canCancelBasedOnTime && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Cancellation Window Closed</p>
              <p className="mt-1 text-red-700">
                Orders can only be cancelled within 2 hours of being placed. Your order is now in production and cannot be cancelled or refunded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show time remaining if within cancellation window */}
      {canCancelFromProdigi && canCancelBasedOnTime && minutesRemaining > 0 && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Cancellation Window: {minutesRemaining} minutes remaining</p>
              <p className="mt-1 text-yellow-700">
                You can cancel this order for a full refund, but only for the next {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''}. After 2 hours, your order goes into production and cannot be cancelled.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canCancelFromProdigi && (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                disabled={!canCancelBasedOnTime}
                className="border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canCancelBasedOnTime ? 'Cancellation window closed - order is in production' : 'Cancel order'}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Order
                {canCancelBasedOnTime && minutesRemaining > 0 && minutesRemaining < 30 && (
                  <span className="ml-2 text-xs">({minutesRemaining}m left)</span>
                )}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold">Cancellation Policy</p>
                  <p className="mt-1 text-sm">
                    Orders can only be cancelled within the first 2 hours of being placed.
                    After 2 hours, your order enters production and cannot be cancelled or refunded.
                  </p>
                  {canCancelBasedOnTime && minutesRemaining > 0 && (
                    <p className="mt-2 text-xs font-semibold text-yellow-200">
                      ⏰ {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''} remaining to cancel
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}

        {canEditAddress && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditAddressDialog(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Fix Address
          </Button>
        )}

        {canChangeShipping && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChangeShippingDialog(true)}
          >
            <Truck className="mr-2 h-4 w-4" />
            Change Shipping
          </Button>
        )}
      </div>

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        orderId={orderId}
        totalPrice={totalPrice}
        onSuccess={() => {
          toast.success('Order cancelled. Your refund will be processed in 5-10 business days.');
          window.location.reload();
        }}
      />

      <EditAddressDialog
        open={showEditAddressDialog}
        onOpenChange={setShowEditAddressDialog}
        orderId={orderId}
        onSuccess={() => {
          toast.success('Address updated successfully!');
          window.location.reload();
        }}
      />

      <ChangeShippingDialog
        open={showChangeShippingDialog}
        onOpenChange={setShowChangeShippingDialog}
        orderId={orderId}
        currentShippingMethod={currentShippingMethod}
        onSuccess={() => {
          toast.success('Shipping method updated!');
          window.location.reload();
        }}
      />
    </div>
  );
}
