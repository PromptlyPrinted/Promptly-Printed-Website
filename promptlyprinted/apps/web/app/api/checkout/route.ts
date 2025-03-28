import { stripe } from "@repo/payments"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@repo/auth/server"

export async function POST(request: Request) {
  try {
    const authSession = await auth()
    if (!authSession?.userId) {
      return NextResponse.json(
        { error: "Authentication required", details: "Please sign in to continue with checkout" },
        { status: 401 }
      )
    }

    const { items } = await request.json()
    console.log("Received items:", items)

    // Calculate total price
    const totalPrice = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    console.log("Calculated total price:", totalPrice)

    // Get the authenticated user
    console.log("Getting authenticated user...")
    const user = await prisma.user.findUnique({
      where: { clerkId: authSession.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found", details: "Please sign in again" },
        { status: 401 }
      )
    }

    console.log("User ID:", user.id)

    // Create order in database
    console.log("Creating order in database...")
    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        totalPrice,
        userId: user.id,
        orderItems: {
          create: items.map((item: any) => ({
            productId: parseInt(item.productId, 10),
            copies: item.quantity,
            price: item.price,
            assets: {
              images: item.images
            }
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })
    console.log("Order created successfully:", order.id)

    // Create Stripe checkout session
    console.log("Creating Stripe checkout session...")
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.images.map((img: any) => img.url)
          },
          unit_amount: Math.round(item.price * 100) // Convert to cents
        },
        quantity: item.quantity
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/product/${items[0].productId}`,
      metadata: {
        orderId: order.id.toString(),
        userId: user.id.toString()
      }
    })
    console.log("Stripe session created successfully:", stripeSession.id)

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Detailed checkout error:", error)
    // Log the full error object
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 