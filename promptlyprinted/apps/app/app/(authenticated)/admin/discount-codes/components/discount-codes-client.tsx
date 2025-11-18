'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Badge } from '@repo/design-system/components/ui/badge';
import { PlusIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { format } from 'date-fns';
import { CreateDiscountCodeDialog } from './create-discount-code-dialog';
import { EditDiscountCodeDialog } from './edit-discount-code-dialog';
import type { DiscountCode } from '@repo/database';

type DiscountCodeWithCount = DiscountCode & {
  _count: {
    usages: number;
  };
};

type DiscountCodesClientProps = {
  initialDiscountCodes: DiscountCodeWithCount[];
};

export function DiscountCodesClient({
  initialDiscountCodes,
}: DiscountCodesClientProps) {
  const [discountCodes, setDiscountCodes] =
    useState<DiscountCodeWithCount[]>(initialDiscountCodes);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeWithCount | null>(
    null
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/discount-codes?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete discount code');
      }

      setDiscountCodes(discountCodes.filter((code) => code.id !== id));
    } catch (error) {
      console.error('Error deleting discount code:', error);
      alert('Failed to delete discount code');
    }
  };

  const handleCodeCreated = (newCode: DiscountCodeWithCount) => {
    setDiscountCodes([newCode, ...discountCodes]);
    setCreateDialogOpen(false);
  };

  const handleCodeUpdated = (updatedCode: DiscountCodeWithCount) => {
    setDiscountCodes(
      discountCodes.map((code) =>
        code.id === updatedCode.id ? updatedCode : code
      )
    );
    setEditingCode(null);
  };

  const getUsageText = (code: DiscountCodeWithCount) => {
    const used = code._count.usages;
    const max = code.maxUses;
    return max ? `${used} / ${max}` : `${used}`;
  };

  const isExpired = (code: DiscountCode) => {
    return code.expiresAt && new Date(code.expiresAt) < new Date();
  };

  const isNotStarted = (code: DiscountCode) => {
    return code.startsAt && new Date(code.startsAt) > new Date();
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Discount Code
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discountCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No discount codes yet. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              discountCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-semibold">
                    {code.code}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {code.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {code.type === 'PERCENTAGE'
                      ? `${code.value}%`
                      : `£${code.value.toFixed(2)}`}
                  </TableCell>
                  <TableCell>{getUsageText(code)}</TableCell>
                  <TableCell>
                    {!code.isActive ? (
                      <Badge variant="destructive">Inactive</Badge>
                    ) : isExpired(code) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : isNotStarted(code) ? (
                      <Badge variant="secondary">Scheduled</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {code.startsAt && (
                      <div>Starts: {format(new Date(code.startsAt), 'PP')}</div>
                    )}
                    {code.expiresAt && (
                      <div>Expires: {format(new Date(code.expiresAt), 'PP')}</div>
                    )}
                    {!code.startsAt && !code.expiresAt && (
                      <span className="text-muted-foreground">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCode(code)}
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(code.id)}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateDiscountCodeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCodeCreated={handleCodeCreated}
      />

      {editingCode && (
        <EditDiscountCodeDialog
          open={!!editingCode}
          onOpenChange={(open) => !open && setEditingCode(null)}
          discountCode={editingCode}
          onCodeUpdated={handleCodeUpdated}
        />
      )}
    </>
  );
}
