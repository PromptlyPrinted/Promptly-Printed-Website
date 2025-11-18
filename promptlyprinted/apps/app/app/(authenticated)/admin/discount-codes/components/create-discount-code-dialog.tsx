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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Switch } from '@repo/design-system/components/ui/switch';

type CreateDiscountCodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeCreated: (code: any) => void;
};

export function CreateDiscountCodeDialog({
  open,
  onOpenChange,
  onCodeCreated,
}: CreateDiscountCodeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    maxUsesPerUser: '',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        isActive: formData.isActive,
      };

      if (formData.minOrderAmount) {
        payload.minOrderAmount = parseFloat(formData.minOrderAmount);
      }
      if (formData.maxUses) {
        payload.maxUses = parseInt(formData.maxUses);
      }
      if (formData.maxUsesPerUser) {
        payload.maxUsesPerUser = parseInt(formData.maxUsesPerUser);
      }
      if (formData.startsAt) {
        payload.startsAt = new Date(formData.startsAt).toISOString();
      }
      if (formData.expiresAt) {
        payload.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create discount code');
      }

      const { discountCode } = await response.json();
      onCodeCreated({
        ...discountCode,
        _count: { usages: 0 },
      });

      // Reset form
      setFormData({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        minOrderAmount: '',
        maxUses: '',
        maxUsesPerUser: '',
        startsAt: '',
        expiresAt: '',
        isActive: true,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to create discount code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Discount Code</DialogTitle>
          <DialogDescription>
            Create a new discount code for your customers
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="e.g., SAVE10"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">
                Value * {formData.type === 'PERCENTAGE' ? '(%)' : '(£)'}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 5.00'}
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minOrderAmount">Minimum Order Amount (£)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderAmount: e.target.value })
                }
              />
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
              <Label htmlFor="startsAt">Start Date</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) =>
                  setFormData({ ...formData, startsAt: e.target.value })
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
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
