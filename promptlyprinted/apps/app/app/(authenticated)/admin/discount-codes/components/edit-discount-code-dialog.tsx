'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Switch } from '@repo/design-system/components/ui/switch';
import type { DiscountCode } from '@repo/database';

type EditDiscountCodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountCode: DiscountCode & { _count: { usages: number } };
  onCodeUpdated: (code: any) => void;
};

export function EditDiscountCodeDialog({
  open,
  onOpenChange,
  discountCode,
  onCodeUpdated,
}: EditDiscountCodeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    maxUses: discountCode.maxUses?.toString() || '',
    maxUsesPerUser: discountCode.maxUsesPerUser?.toString() || '',
    expiresAt: discountCode.expiresAt
      ? new Date(discountCode.expiresAt).toISOString().slice(0, 16)
      : '',
    isActive: discountCode.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        id: discountCode.id,
        isActive: formData.isActive,
      };

      if (formData.maxUses) {
        payload.maxUses = parseInt(formData.maxUses);
      }
      if (formData.maxUsesPerUser) {
        payload.maxUsesPerUser = parseInt(formData.maxUsesPerUser);
      }
      if (formData.expiresAt) {
        payload.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      const response = await fetch('/api/admin/discount-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update discount code');
      }

      const { discountCode: updated } = await response.json();
      onCodeUpdated({
        ...updated,
        _count: discountCode._count,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to update discount code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Discount Code</DialogTitle>
          <DialogDescription>
            Update settings for {discountCode.code}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-mono font-semibold">{discountCode.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>
                    {discountCode.type === 'PERCENTAGE'
                      ? 'Percentage'
                      : 'Fixed Amount'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value:</span>
                  <span>
                    {discountCode.type === 'PERCENTAGE'
                      ? `${discountCode.value}%`
                      : `£${discountCode.value.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Times Used:</span>
                  <span>{discountCode._count.usages}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxUses">Maximum Total Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                placeholder="Optional - unlimited if not set"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxUsesPerUser">Maximum Uses Per User</Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                min="1"
                placeholder="Optional - unlimited if not set"
                value={formData.maxUsesPerUser}
                onChange={(e) =>
                  setFormData({ ...formData, maxUsesPerUser: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expiry Date</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
