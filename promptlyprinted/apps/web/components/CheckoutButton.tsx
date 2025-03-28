"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "@repo/design-system/components/ui/use-toast"

interface CheckoutItem {
  productId: number
  name: string
  price: number
  quantity: number
  images: { url: string }[]
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
      
      // Create a checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          items: items.map(item => ({
            ...item,
            productId: Number(item.productId)
          }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      router.push(data.url)
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      })
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
      {isLoading ? "Processing..." : "Checkout Now"}
    </Button>
  )
} 