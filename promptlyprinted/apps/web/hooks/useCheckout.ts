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
      console.log('Starting checkout process...');

      if (!session?.user) {
        throw new Error('You must be logged in to checkout');
      }

      // For Better Auth, we can just use the session directly in API calls
      // or get the session token if needed

      const itemsWithSavedImages = await Promise.all(
        items.map(async (item) => {
          console.log('Processing item:', item);
          const imageUrl = item.images[0].url;

          if (imageUrl.includes('/api/save-temp-image')) {
            console.log('Using existing saved image URL:', imageUrl);
            return { ...item, images: [{ url: imageUrl }] };
          }

          console.log('Saving image URL:', imageUrl);
          const response = await fetch('/api/save-temp-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: imageUrl }),
          });
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.error || 'Failed to save image');

          return {
            ...item,
            images: [{ url: `/api/save-temp-image?id=${data.id}` }],
          };
        })
      );

      console.log('Items processed:', itemsWithSavedImages);

      const checkoutBody = {
        items: itemsWithSavedImages.map((item) => ({
          productId: Number.parseInt(item.productId, 10),
          name: item.name,
          price: Number(item.price),
          copies: Number(item.copies || 1),
          color: item.color,
          size: item.size,
          designUrl: item.designUrl,
          customization: item.customization,
          recipientCostAmount: Number(item.recipientCostAmount || item.price),
          currency: item.currency || 'USD',
          merchantReference: item.merchantReference || `item_${item.productId}`,
          sku: item.sku,
          images: [{ url: item.images[0].url }],
        })),
      };

      console.log(
        'Checkout request body:',
        JSON.stringify(checkoutBody, null, 2)
      );

      const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/cancel`;
      const response = await fetch(
        `/api/checkout?successUrl=${encodeURIComponent(
          successUrl
        )}&cancelUrl=${encodeURIComponent(cancelUrl)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checkoutBody),
        }
      );

      const data = await response.json();
      console.log('Checkout response:', data);

      if (!response.ok) {
        console.error('Checkout error details:', data);
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to process checkout'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { initiateCheckout: handleCheckout, isLoading };
}
