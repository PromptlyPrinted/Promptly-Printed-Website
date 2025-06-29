import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { generateExcelReport } from '../../../lib/generate-report';
import { calculateMetrics } from '../../../lib/metrics';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify admin status
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch data
    const [allOrders, allUsers] = await Promise.all([
      database.order.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      database.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate metrics
    const metrics = calculateMetrics(allOrders, allUsers);

    // Generate Excel report
    const excelBuffer = generateExcelReport(metrics);

    // Set response headers for Excel download
    const headers = new Headers();
    headers.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    headers.set(
      'Content-Disposition',
      'attachment; filename=promptly-printed-report.xlsx'
    );

    return new NextResponse(excelBuffer, {
      headers,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return new NextResponse('Error generating report', { status: 500 });
  }
}
