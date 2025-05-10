"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"

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
  const { getToken } = useAuth()

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      console.log("Starting checkout process...")

      // Get the auth token
      const token = await getToken()
      if (!token) {
        throw new Error("You must be logged in to checkout")
      }

      // Process items and their images
      const itemsWithSavedImages = await Promise.all(
        items.map(async (item) => {
          console.log("Processing item:", item)
          const imageUrl = item.images[0].url

          // If it's already a saved image URL, use it directly
          if (imageUrl.includes("/api/save-temp-image")) {
            console.log("Using existing saved image URL:", imageUrl)
            return { ...item, images: [{ url: imageUrl }] }
          }

          // For any other URL, save it first
          console.log("Saving image URL:", imageUrl)
          const response = await fetch("/api/save-temp-image", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ url: imageUrl }),
          })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || "Failed to save image")
          
          return { ...item, images: [{ url: `/api/save-temp-image?id=${data.id}` }] }
        })
      )

      console.log("Items processed:", itemsWithSavedImages)

      // Create checkout session
      const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/cancel`;
      const response = await fetch(`/api/checkout?successUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsWithSavedImages }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session")

      // Redirect to checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process checkout")
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