'use client';

import { useSession } from '@repo/auth/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { CheckoutItem } from '@/types/checkout';

export function useCheckout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleCheckout = async (items: CheckoutItem[]) => {
    try {
      setIsLoading(true);


      // Validate that all items have valid images
      for (const item of items) {
        if (!item.images || !item.images[0] || !item.images[0].url || item.images[0].url.trim() === '') {
          console.error('Invalid item image:', item);
          throw new Error(`Missing product image for "${item.name}". Please refresh the page and try again.`);
        }
      }

      // Prepare items for checkout
      const checkoutItems = items.map((item) => {
        // Get design URL from either designUrl, imageUrl, or images array
        const designUrl = item.designUrl || (item as any).imageUrl || item.images?.[0]?.url;
        // Get 300 DPI print-ready URL if available
        const printReadyUrl = (item as any).printReadyUrl;

        return {
          productId: Number.parseInt(item.productId, 10),
          name: item.name,
          price: Number(item.price),
          copies: Number(item.copies || 1),
          color: item.color,
          size: item.size,
          designUrl: designUrl, // The actual design image to be printed
          printReadyUrl: printReadyUrl, // 300 DPI version for Prodigi
          images: [{ url: item.images?.[0]?.url || designUrl }], // Product preview image
        };
      });



      // Store items in localStorage for the checkout page
      // Exclude printReadyUrl from localStorage to avoid quota issues (it's only needed server-side)
      const itemsForStorage = checkoutItems.map(({ printReadyUrl, ...item }) => item);
      localStorage.setItem('cartItems', JSON.stringify(itemsForStorage));

      // Navigate to the custom checkout page
      router.push('/checkout');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to process checkout'
      );
      setIsLoading(false);
    }
  };

  return { initiateCheckout: handleCheckout, isLoading };
}
