'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle, Ban, Edit, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CancelOrderDialog } from './cancel-order-dialog';
import { EditAddressDialog } from './edit-address-dialog';
import { ChangeShippingDialog } from './change-shipping-dialog';

interface OrderActionsProps {
  orderId: number;
  orderStatus: string;
  prodigiOrderId: string | null;
  currentShippingMethod?: string;
  totalPrice: number;
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

export function OrderActions({
  orderId,
  orderStatus,
  prodigiOrderId,
  currentShippingMethod,
  totalPrice,
}: OrderActionsProps) {
  const [actions, setActions] = useState<ActionAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditAddressDialog, setShowEditAddressDialog] = useState(false);
  const [showChangeShippingDialog, setShowChangeShippingDialog] = useState(false);

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
        Checking available actions...
      </div>
    );
  }

  if (!prodigiOrderId) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        No Prodigi order found - actions unavailable
      </div>
    );
  }

  if (orderStatus === 'CANCELED') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Ban className="h-4 w-4" />
        Order is cancelled
      </div>
    );
  }

  const canCancel = actions?.cancel?.isAvailable === 'Yes';
  const canEditAddress = actions?.changeRecipientDetails?.isAvailable === 'Yes';
  const canChangeShipping = actions?.changeShippingMethod?.isAvailable === 'Yes';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowCancelDialog(true)}
          disabled={!canCancel}
          title={!canCancel ? actions?.cancel?.reason : 'Cancel order with full refund'}
        >
          <Ban className="mr-2 h-4 w-4" />
          Cancel Order
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditAddressDialog(true)}
          disabled={!canEditAddress}
          title={
            !canEditAddress
              ? actions?.changeRecipientDetails?.reason
              : 'Edit shipping address'
          }
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Address
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChangeShippingDialog(true)}
          disabled={!canChangeShipping}
          title={
            !canChangeShipping
              ? actions?.changeShippingMethod?.reason
              : 'Change shipping method'
          }
        >
          <Truck className="mr-2 h-4 w-4" />
          Change Shipping
        </Button>
      </div>

      {!canCancel && !canEditAddress && !canChangeShipping && (
        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          Order is in production and cannot be modified
        </div>
      )}

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        orderId={orderId}
        totalPrice={totalPrice}
        onSuccess={() => {
          toast.success('Order cancelled successfully');
          window.location.reload();
        }}
      />

      <EditAddressDialog
        open={showEditAddressDialog}
        onOpenChange={setShowEditAddressDialog}
        orderId={orderId}
        onSuccess={() => {
          toast.success('Address updated successfully');
          window.location.reload();
        }}
      />

      <ChangeShippingDialog
        open={showChangeShippingDialog}
        onOpenChange={setShowChangeShippingDialog}
        orderId={orderId}
        currentShippingMethod={currentShippingMethod}
        onSuccess={() => {
          toast.success('Shipping method updated successfully');
          window.location.reload();
        }}
      />
    </div>
  );
}
