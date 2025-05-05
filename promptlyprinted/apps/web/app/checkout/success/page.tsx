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
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    })

    // Create Prodigi order
    if (order.recipient) {
      try {
        console.log('Starting Prodigi order creation for order:', order.id)
        
        // Prepare items with high-res images
        const items = await Promise.all(
          order.orderItems.map(async (item) => {
            console.log('Processing item:', item.id, 'with SKU:', item.product.sku)
            
            const spec = getImageSpecForSku(item.product.sku)
            if (!spec) {
              throw new Error(`No image specifications found for SKU: ${item.product.sku}`)
            }
            console.log('Found image spec for SKU:', spec)

            // Get the first image URL from the product's images
            const imageUrl = item.product.images[0]?.url
            if (!imageUrl) {
              throw new Error(`No image found for product SKU: ${item.product.sku}`)
            }
            console.log('Found image URL:', imageUrl)

            // Generate high-res image URL
            const highResUrl = await generateHighResImage(imageUrl, spec)
            console.log('Generated high-res URL:', highResUrl)

            return {
              sku: item.product.sku,
              copies: item.copies,
              merchantReference: `item_${item.id}`,
              sizing: "fillPrintArea" as const,
              recipientCost: {
                amount: item.price.toString(),
                currency: session.currency?.toUpperCase() || "USD"
              },
              assets: [{
                printArea: "default",
                url: highResUrl
              }]
            }
          })
        )

        console.log('Prepared items for Prodigi order:', items)

        const prodigiOrder = await prodigiService.createOrder({
          shippingMethod: "Standard",
          merchantReference: `order_${order.id}`,
          idempotencyKey: `order_${order.id}_${Date.now()}`,
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/prodigi`,
          recipient: {
            name: order.recipient.name,
            email: order.recipient.email || "",
            phoneNumber: order.recipient.phoneNumber || undefined,
            address: {
              line1: order.recipient.addressLine1,
              line2: order.recipient.addressLine2 || undefined,
              postalOrZipCode: order.recipient.postalCode,
              countryCode: order.recipient.countryCode,
              townOrCity: order.recipient.city,
              stateOrCounty: order.recipient.state || undefined
            }
          },
          items,
          metadata: {
            orderId: order.id,
            userId: order.userId,
            stripeSessionId: session.id
          }
        })

        console.log('Created Prodigi order:', prodigiOrder)

        // Update order with Prodigi order ID and status
        await prisma.order.update({
          where: { id: order.id },
          data: {
            prodigiOrderId: prodigiOrder.id,
            prodigiCreatedAt: new Date(prodigiOrder.created),
            prodigiLastUpdated: new Date(prodigiOrder.lastUpdated),
            prodigiStage: prodigiOrder.status.stage,
            prodigiStatusJson: prodigiOrder.status,
            outcome: prodigiOrder.outcome
          }
        })

        console.log('Updated order with Prodigi details')
      } catch (error) {
        console.error("Failed to create Prodigi order:", error)
        // Log the error for monitoring
        await prisma.log.create({
          data: {
            level: "ERROR",
            message: "Failed to create Prodigi order",
            metadata: {
              orderId: order.id,
              error: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined
            }
          }
        })
        // TODO: Send notification to admin about failed order
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