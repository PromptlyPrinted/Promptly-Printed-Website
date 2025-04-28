"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface CheckoutImage {
  url: string
  dpi?: number
  width?: number
  height?: number
}

interface CheckoutItem {
  productId: string
  name: string
  price: number
  copies?: number
  images: CheckoutImage[]
}

interface CheckoutButtonProps {
  items: CheckoutItem[]
  variant?: "default" | "outline"
  className?: string
}

export function CheckoutButton({ items, variant = "default", className }: CheckoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      
      console.log('Initial items:', items);
      
      // Save images to temporary storage first
      const itemsWithTempImages = await Promise.all(items.map(async (item) => {
        console.log('Processing item:', item);
        
        const imagesWithTempUrls = await Promise.all(item.images.map(async (img) => {
          console.log('Processing image:', img);
          
          // Save the image URL temporarily
          const saveResponse = await fetch('/api/save-temp-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              url: img.url,
              name: 'Checkout Image'
            })
          });

          const data = await saveResponse.json();
          
          if (!saveResponse.ok) {
            console.error('Failed to save image:', data.error);
            toast.error(data.error || 'Failed to save image');
            throw new Error('Failed to save image for checkout');
          }

          const { id: imageId } = data;
          console.log('Got image ID:', imageId);

          return {
            ...img,
            url: `/api/save-temp-image?id=${imageId}` // Use the short ID instead of the full URL
          };
        }));

        return {
          ...item,
          images: imagesWithTempUrls
        };
      }));

      console.log('Items with temp images:', itemsWithTempImages);
      
      // Create a checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemsWithTempImages),
      })

      const data = await response.json();

      if (!response.ok) {
        console.error('Checkout Error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          requestBody: itemsWithTempImages
        });
        toast.error(data.error || 'Failed to create checkout session');
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.url || !data.orderId) {
        console.error('Invalid checkout response:', data);
        toast.error('Invalid checkout response');
        throw new Error("Invalid checkout response");
      }

      console.log('Order Created:', {
        orderId: data.orderId,
        status: data.status,
        redirectUrl: data.url
      });

      // Show success message and redirect
      toast.success('Order created successfully!');
      router.push(data.url)
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error('Failed to start checkout process');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      variant={variant}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Buy Now"}
    </Button>
  )
}