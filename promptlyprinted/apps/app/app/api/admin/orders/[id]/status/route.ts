import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { database } from "@repo/database";
import { getProdigiClient } from "@/lib/prodigi";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify admin status
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["PENDING", "COMPLETED", "CANCELED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return new NextResponse("Invalid order ID", { status: 400 });
    }

    const order = await database.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // If Prodigi API key is set and order has a Prodigi order ID, update status in Prodigi
    if (order.prodigiOrderId) {
      const prodigiClient = getProdigiClient();
      if (prodigiClient) {
        try {
          // Get current Prodigi order status
          const prodigiOrder = await prodigiClient.getOrder(order.prodigiOrderId);
          
          // Only attempt to update Prodigi if the order is not already in a final state
          if (!["complete", "cancelled", "error"].includes(prodigiOrder.status)) {
            const prodigiAction = prodigiClient.mapLocalStatusToProdigi(status);
            if (prodigiAction) {
              await prodigiClient.updateOrderStatus(order.prodigiOrderId, prodigiAction);
            }
          }
        } catch (error) {
          console.error("Error updating Prodigi order status:", error);
          // Don't fail the local update if Prodigi update fails
        }
      }
    }

    const updatedOrder = await database.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_STATUS_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 