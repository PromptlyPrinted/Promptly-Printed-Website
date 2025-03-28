import { redirect } from "next/navigation"
import { stripe } from "@repo/payments"
import prisma from "@/lib/prisma"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prodigiService } from "@/lib/prodigi"
import { generateHighResImage, getImageSpecForSku } from "@/lib/imageSpecs"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string }
}) {
  if (!searchParams.session_id) {
    redirect("/")
  }

  // Get checkout session
  const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)
  if (!session) {
    redirect("/")
  }

  // Update order status if payment was successful
  if (session.payment_status === "paid" && session.metadata?.orderId) {
    const order = await prisma.order.update({
      where: {
        id: parseInt(session.metadata.orderId)
      },
      data: {
        status: "COMPLETED",
        payment: {
          create: {
            stripeId: session.id,
            status: "completed",
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || "usd"
          }
        }
      },
      include: {
        recipient: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // Create Prodigi order
    if (order.recipient) {
      try {
        // Prepare items with high-res images
        const items = await Promise.all(
          order.orderItems.map(async (item) => {
            const spec = getImageSpecForSku(item.product.sku)
            if (!spec) {
              throw new Error(`No image specifications found for SKU: ${item.product.sku}`)
            }

            // Generate high-res image URL
            const highResUrl = await generateHighResImage(item.product.imageUrl, spec)

            return {
              sku: item.product.sku,
              copies: item.copies,
              assets: [{
                printArea: "default",
                url: highResUrl
              }]
            }
          })
        )

        const prodigiOrder = await prodigiService.createOrder({
          shippingMethod: "Standard", // Or get from session metadata
          recipient: {
            name: order.recipient.name,
            email: order.recipient.email || "",
            phoneNumber: order.recipient.phoneNumber,
            address: {
              line1: order.recipient.addressLine1,
              line2: order.recipient.addressLine2,
              postalOrZipCode: order.recipient.postalCode,
              countryCode: order.recipient.countryCode,
              townOrCity: order.recipient.city,
              stateOrCounty: order.recipient.state
            }
          },
          items
        })

        // Update order with Prodigi order ID
        await prisma.order.update({
          where: { id: order.id },
          data: {
            prodigiOrderId: prodigiOrder.id
          }
        })
      } catch (error) {
        console.error("Failed to create Prodigi order:", error)
        // Consider sending notification to admin or retrying later
      }
    }
  }

  return (
    <div className="container mx-auto py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground">
            Your order has been successfully placed. We'll send you an email with your order details.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/orders">
            <Button variant="outline" className="w-full">
              View Order Status
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 