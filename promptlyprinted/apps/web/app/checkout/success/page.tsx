import { redirect } from "next/navigation"
import { stripe } from "@repo/payments"
import { prisma } from "@repo/database"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prodigiService } from "@/lib/prodigi"
import { getImageUrl } from "@/lib/get-image-url"
import { env } from "@repo/env"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string }
}) {
  const sessionId = await searchParams.session_id
  if (!sessionId) {
    redirect("/")
  }

  // Get checkout session
  const session = await stripe.checkout.sessions.retrieve(sessionId)
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
        },
        recipient: {
          update: {
            name: session.customer_details?.name || "Pending",
            email: session.customer_details?.email || "pending@example.com",
            phoneNumber: session.customer_details?.phone || undefined,
            addressLine1: session.customer_details?.address?.line1 || "Pending",
            addressLine2: session.customer_details?.address?.line2 || undefined,
            postalCode: session.customer_details?.address?.postal_code || "00000",
            countryCode: session.customer_details?.address?.country || "US",
            city: session.customer_details?.address?.city || "Pending",
            state: session.customer_details?.address?.state || undefined,
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
        console.log('Order details:', {
          id: order.id,
          recipient: order.recipient,
          items: order.orderItems.map(item => ({
            id: item.id,
            sku: item.product.sku,
            copies: item.copies,
            assets: item.assets
          }))
        })

        if (!env.PRODIGI_API_KEY) {
          throw new Error('PRODIGI_API_KEY is not defined in environment variables')
        }
        
        // Prepare items with images
        const items = await Promise.all(
          order.orderItems.map(async (item) => {
            console.log('Processing item:', item.id, 'with SKU:', item.product.sku)
            console.log('Item assets:', item.assets)
            
            // Get the design image from the order item's assets
            const designImage = item.assets[0]?.url
            if (!designImage) {
              console.error('No design image found in assets:', item.assets)
              throw new Error(`No design image found for order item: ${item.id}`)
            }
            console.log('Found design image URL:', designImage)

            // Resolve the image URL
            const imageUrl = await getImageUrl(designImage)
            if (!imageUrl) {
              console.error('Failed to resolve image URL:', designImage)
              throw new Error(`Could not resolve design image URL: ${designImage}`)
            }
            console.log('Resolved design image URL:', imageUrl)

            // Map size to valid Prodigi size values
            const sizeMap: Record<string, string> = {
              'XXS': '2xs',
              'XS': 'xs',
              'S': 's',
              'M': 'm',
              'L': 'l',
              'XL': 'xl',
              'XXL': '2xl',
              'XXXL': '3xl',
              'XXXXL': '4xl',
              'XXXXXL': '5xl'
            }

            const prodigiSize = sizeMap[item.attributes?.size || item.product.size[0]] || 'm'

            return {
              sku: item.product.sku,
              copies: item.copies,
              merchantReference: `item_${item.id}`,
              sizing: item.attributes?.sizing || "fillPrintArea",
              attributes: {
                color: item.attributes?.color || item.product.color[0],
                size: prodigiSize
              },
              recipientCost: {
                amount: item.price.toString(),
                currency: session.currency?.toUpperCase() || "USD"
              },
              assets: [{
                printArea: item.attributes?.printArea || "front",
                url: imageUrl
              }]
            }
          })
        )

        console.log('Prepared items for Prodigi order:', items)

        const prodigiOrder = await prodigiService.createOrder({
          shippingMethod: "Standard",
          merchantReference: `order_${order.id}`,
          idempotencyKey: `order_${order.id}_${Date.now()}`,
          callbackUrl: `${env.NEXT_PUBLIC_WEB_URL}/api/webhooks/prodigi`,
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
            prodigiOrderId: prodigiOrder.order?.id,
            prodigiCreatedAt: new Date(),
            prodigiLastUpdated: new Date(),
            prodigiStage: prodigiOrder.outcome || "OnHold",
            prodigiStatusJson: prodigiOrder,
            outcome: prodigiOrder.outcome
          }
        })

        console.log('Updated order with Prodigi details')
      } catch (error) {
        console.error("Failed to create Prodigi order:", error)
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          orderId: order.id,
          env: {
            hasProdigiApiKey: !!env.PRODIGI_API_KEY,
            prodigiApiKeyLength: env.PRODIGI_API_KEY?.length
          }
        })
        // Log the error for monitoring
        await prisma.log.create({
          data: {
            level: "ERROR",
            message: "Failed to create Prodigi order",
            metadata: {
              orderId: order.id,
              error: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
              env: {
                hasProdigiApiKey: !!env.PRODIGI_API_KEY,
                prodigiApiKeyLength: env.PRODIGI_API_KEY?.length
              }
            }
          }
        })

        // Update order status to indicate Prodigi order creation failed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELED",
            prodigiStatusJson: {
              error: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    } else {
      console.error('No recipient found for order:', order.id)
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
          {session.payment_status === "paid" && session.metadata?.orderId && (
            <p className="text-yellow-600 mt-4">
              Your payment was successful, but there was an issue processing your order. Our team has been notified and will handle this for you.
            </p>
          )}
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