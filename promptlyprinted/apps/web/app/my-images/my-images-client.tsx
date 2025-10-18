'use client';

import Image from 'next/image';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { ShoppingBag, Upload, Heart, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ImageType = {
  id: string;
  url: string;
  name: string;
};

type MyImagesClientProps = {
  images: ImageType[];
};

type ApparelOption = {
  name: string;
  category: string;
  sku: string;
  productId?: number;
};

const APPAREL_OPTIONS: ApparelOption[] = [
  { name: 'Men\'s T-Shirt', category: 'Mens', sku: 'GLOBAL-TEE-BC-3413' },
  { name: 'Women\'s T-Shirt', category: 'Womens', sku: 'A-T-BC-6004' },
  { name: 'Kid\'s T-Shirt', category: 'Kids', sku: 'A-KT-GD64000B' },
  { name: 'Men\'s Hoodie', category: 'Mens', sku: 'HOOD-GD-18500' },
  { name: 'Women\'s Hoodie', category: 'Womens', sku: 'HOOD-GD-18500L' },
];

export function MyImagesClient({ images }: MyImagesClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isApparelModalOpen, setIsApparelModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedProductForSubmit, setSelectedProductForSubmit] = useState<ApparelOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apparelOptionsWithIds, setApparelOptionsWithIds] = useState<ApparelOption[]>(APPAREL_OPTIONS);

  // Fetch product IDs when component mounts
  useEffect(() => {
    const fetchProductIds = async () => {
      const optionsWithIds = await Promise.all(
        APPAREL_OPTIONS.map(async (option) => {
          try {
            const response = await fetch(`/api/products/by-sku?sku=${option.sku}`);
            if (response.ok) {
              const product = await response.json();
              return { ...option, productId: product.id };
            }
          } catch (error) {
            console.error(`Error fetching product ${option.sku}:`, error);
          }
          return option;
        })
      );
      setApparelOptionsWithIds(optionsWithIds);
    };

    fetchProductIds();
  }, []);

  const handlePutOnApparel = (image: ImageType) => {
    setSelectedImage(image);
    setIsApparelModalOpen(true);
  };

  const handleSubmitToGallery = (image: ImageType) => {
    setSelectedImage(image);
    setIsSubmitModalOpen(true);
  };

  const handleApparelSelect = (apparel: typeof APPAREL_OPTIONS[0]) => {
    if (selectedImage) {
      router.push(`/products/${apparel.category}/${apparel.sku}?imageUrl=${encodeURIComponent(selectedImage.url)}`);
    }
    setIsApparelModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedImage || !selectedProductForSubmit) {
      alert('Please select an apparel type first');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/gallery/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: selectedImage.id,
          imageUrl: selectedImage.url,
          imageName: selectedImage.name,
          productId: selectedProductForSubmit.productId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Successfully submitted to gallery!');
        setIsSubmitModalOpen(false);
        setSelectedProductForSubmit(null);
      } else {
        alert(data.error || 'Failed to submit to gallery. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting to gallery:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-semibold text-2xl">My Images</h1>
      {images.length === 0 ? (
        <p>You have no saved images.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={img.url}
                  alt={img.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <div className="mt-3 space-y-2">
                <p className="font-medium text-sm truncate">{img.name}</p>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => handlePutOnApparel(img)}
                    variant="default"
                    size="sm"
                    className="w-full gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Put on Apparel
                  </Button>
                  <Button
                    onClick={() => handleSubmitToGallery(img)}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Submit to Gallery
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apparel Selection Modal */}
      <Dialog open={isApparelModalOpen} onOpenChange={setIsApparelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Apparel Type</DialogTitle>
            <DialogDescription>
              Choose which type of apparel you'd like to put your design on.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            {apparelOptionsWithIds.map((apparel) => (
              <Button
                key={apparel.sku}
                onClick={() => handleApparelSelect(apparel)}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <ShoppingBag className="h-5 w-5 text-[#16C1A8]" />
                <span>{apparel.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit to Gallery Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit to Gallery</DialogTitle>
            <DialogDescription>
              Share your creation with the community! Select which apparel type you'd like to showcase your design on.
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4 py-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-medium text-center">{selectedImage.name}</p>

              {/* Apparel Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Apparel Type:</label>
                <div className="grid grid-cols-1 gap-2">
                  {apparelOptionsWithIds.map((apparel) => (
                    <button
                      key={apparel.sku}
                      onClick={() => setSelectedProductForSubmit(apparel)}
                      disabled={!apparel.productId}
                      className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedProductForSubmit?.sku === apparel.sku
                          ? 'border-[#16C1A8] bg-[#16C1A8]/10'
                          : 'border-gray-200 hover:border-[#16C1A8]/50'
                      }`}
                    >
                      <ShoppingBag className={`h-5 w-5 ${
                        selectedProductForSubmit?.sku === apparel.sku
                          ? 'text-[#16C1A8]'
                          : 'text-gray-400'
                      }`} />
                      <span className="font-medium text-sm">{apparel.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedProductForSubmit || isSubmitting}
                  className="flex-1 gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit to Gallery'}
                </Button>
                <Button
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    setSelectedProductForSubmit(null);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
