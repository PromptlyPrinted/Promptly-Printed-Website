'use client';

import { useDesigns } from '@/hooks/use-designs';
import type { DesignResponse } from '@/types/design';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { useEffect, useState } from 'react';
import { DesignCard } from './design-card';

interface DesignPickerProps {
  productId: number;
  onDesignSelect: (design: DesignResponse) => void;
  trigger?: React.ReactNode;
}

export function DesignPicker({
  productId,
  onDesignSelect,
  trigger,
}: DesignPickerProps) {
  const [open, setOpen] = useState(false);
  const [designs, setDesigns] = useState<DesignResponse[]>([]);
  const { getDesigns, isLoading } = useDesigns();

  useEffect(() => {
    if (open) {
      getDesigns().then(setDesigns).catch(console.error);
    }
  }, [open]);

  const handleDesignSelect = (design: DesignResponse) => {
    onDesignSelect(design);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Use Saved Design</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Design</DialogTitle>
          <DialogDescription>
            Select one of your saved designs to use with this product
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">Loading designs...</div>
        ) : designs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No saved designs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onSelect={handleDesignSelect}
                selectable
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
