import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import { calculateMetrics } from "../../../lib/metrics";
import { generatePDFReport } from "../../../lib/generate-report";
import { NextResponse } from "next/server";

export async function POST() {
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

    // Fetch data for report
    const [allOrders, allUsers] = await Promise.all([
      database.order.findMany({
        orderBy: { createdAt: "desc" },
      }),
      database.user.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate metrics
    const metrics = calculateMetrics(allOrders, allUsers);

    // Generate PDF
    const pdfDataUri = generatePDFReport(metrics);

    // Return PDF
    return new NextResponse(pdfDataUri, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="analytics-report.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return new NextResponse("Error generating report", { status: 500 });
  }
} 