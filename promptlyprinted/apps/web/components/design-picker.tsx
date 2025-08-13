'use client';

import { useSavedImages, type SavedImage } from '@/hooks/use-saved-images';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface DesignPickerProps {
  productId: number;
  onDesignSelect: (image: SavedImage) => void;
  trigger?: React.ReactNode;
}

export function DesignPicker({
  productId,
  onDesignSelect,
  trigger,
}: DesignPickerProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<SavedImage[]>([]);
  const { getSavedImages, isLoading } = useSavedImages();

  useEffect(() => {
    if (open) {
      getSavedImages().then(setImages).catch(console.error);
    }
  }, [open]);

  const handleImageSelect = (image: SavedImage) => {
    onDesignSelect(image);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Choose an Existing Image</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose an Image</DialogTitle>
          <DialogDescription>
            Select one of your saved images to use with this product
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center">Loading images...</div>
        ) : images.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No saved images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative cursor-pointer overflow-hidden rounded-lg border p-2 hover:shadow-md"
                onClick={() => handleImageSelect(image)}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  width={200}
                  height={200}
                  className="h-48 w-full rounded object-cover"
                />
                <div className="mt-2">
                  <p className="text-sm font-medium truncate">{image.name}</p>
                  {image.product && (
                    <p className="text-xs text-gray-500 truncate">
                      {image.product.name}
                    </p>
                  )}
                </div>
                <Button
                  className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
                  size="sm"
                >
                  Use this Image
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
