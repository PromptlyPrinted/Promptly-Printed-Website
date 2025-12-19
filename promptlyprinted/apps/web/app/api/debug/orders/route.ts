import { NextRequest, NextResponse } from 'next/server';
import { database as prisma } from '@repo/database';

/**
 * DIAGNOSTIC ENDPOINT - Check recent orders and their Prodigi status
 * Remove this in production or add authentication
 */
export async function GET(request: NextRequest) {
  // Only allow in development or with a secret key
  const authKey = request.headers.get('x-debug-key');
  const expectedKey = process.env.DEBUG_API_KEY || 'dev-only';
  
  if (process.env.NODE_ENV === 'production' && authKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get last 10 orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        prodigiOrderId: true,
        metadata: true,
        orderItems: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            color: true,
            size: true,
            assets: true,
          }
        },
      },
    });

    // Check for processing errors
    const recentErrors = await prisma.orderProcessingError.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderId: true,
        error: true,
        retryCount: true,
        lastAttempt: true,
        createdAt: true,
      },
    });

    // Check environment variables
    const envCheck = {
      hasProdigiApiKey: !!process.env.PRODIGI_API_KEY,
      prodigiApiKeyLength: process.env.PRODIGI_API_KEY?.length || 0,
      prodigiApiKeyPrefix: process.env.PRODIGI_API_KEY?.substring(0, 8) + '...',
      hasSquareAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
      hasSquareLocationId: !!process.env.SQUARE_LOCATION_ID,
      nodeEnv: process.env.NODE_ENV,
    };

    // Analyze orders
    const analysis = recentOrders.map(order => {
      const metadata = order.metadata as any || {};
      return {
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        total: order.total,
        hasProdigi: !!order.prodigiOrderId,
        prodigiOrderId: order.prodigiOrderId,
        prodigiError: metadata.prodigiError || null,
        prodigiErrorTime: metadata.prodigiErrorTime || null,
        prodigiProcessingKey: metadata.prodigiProcessingKey || null,
        prodigiProcessingFailed: metadata.prodigiProcessingFailed || null,
        source: metadata.source || 'unknown',
        squarePaymentId: metadata.squarePaymentId || null,
        squarePaymentStatus: metadata.squarePaymentStatus || null,
        itemCount: order.orderItems.length,
        items: order.orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          hasAssets: !!item.assets,
          assetsPreview: item.assets ? JSON.stringify(item.assets).substring(0, 100) + '...' : null,
        })),
      };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      recentOrders: analysis,
      recentErrors,
      summary: {
        totalOrders: recentOrders.length,
        ordersWithProdigi: recentOrders.filter(o => o.prodigiOrderId).length,
        ordersWithErrors: recentOrders.filter(o => (o.metadata as any)?.prodigiError).length,
        processingErrors: recentErrors.length,
      },
    });

  } catch (error: any) {
    console.error('[Debug Orders] Error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}



