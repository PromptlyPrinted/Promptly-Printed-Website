import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';
import { NextResponse } from 'next/server';

/**
 * Prodigi Webhook Handler
 *
 * Handles CloudEvents callbacks from Prodigi for:
 * - Order status changes (stage transitions)
 * - Shipment notifications
 * - Asset download status
 * - Production updates
 *
 * CloudEvents spec: https://github.com/cloudevents/spec/blob/v1.0/spec.md
 * Prodigi webhook docs: https://www.prodigi.com/print-api/docs/reference/#callbacks
 */

interface ProdigiCloudEvent {
  specversion: string;
  type: string;
  source: string;
  id: string;
  time: string;
  datacontenttype: string;
  subject: string; // Order ID (e.g., "ord_1469466")
  data: {
    order: {
      id: string;
      created: string;
      lastUpdated?: string;
      status: {
        stage: 'InProgress' | 'Complete' | 'Cancelled';
        issues: Array<{
          objectId: string;
          errorCode: string;
          description: string;
          authorisationDetails?: {
            authorisationUrl: string;
            paymentDetails: {
              amount: string;
              currency: string;
            };
          };
        }>;
        details: {
          downloadAssets: 'NotStarted' | 'InProgress' | 'Complete' | 'Error';
          printReadyAssetsPrepared: 'NotStarted' | 'InProgress' | 'Complete' | 'Error';
          allocateProductionLocation: 'NotStarted' | 'InProgress' | 'Complete' | 'Error';
          inProduction: 'NotStarted' | 'InProgress' | 'Complete' | 'Error';
          shipping: 'NotStarted' | 'InProgress' | 'Complete' | 'Error';
        };
      };
      charges: any[];
      shipments: Array<{
        id: string;
        carrier: {
          name: string;
          service: string;
        };
        tracking?: {
          number: string;
          url: string;
        };
        dispatchDate: string;
        items: Array<{
          id: string;
          copies: number;
        }>;
      }>;
      merchantReference: string;
      shippingMethod: string;
      recipient: {
        name: string;
        email?: string;
        phoneNumber?: string;
        address: {
          line1: string;
          line2?: string;
          postalOrZipCode: string;
          countryCode: string;
          townOrCity: string;
          stateOrCounty?: string;
        };
      };
      items: any[];
      packingSlip?: any;
      metadata?: Record<string, any>;
    };
  };
}

/**
 * Parse event type from CloudEvents format
 * Example: "com.prodigi.order.status.stage.changed#InProgress"
 * Returns: { object: 'order', path: 'status.stage.changed', value: 'InProgress' }
 */
function parseEventType(type: string) {
  const match = type.match(/^com\.prodigi\.(.+?)#(.+)$/);
  if (!match) {
    return null;
  }

  const [, path, value] = match;
  const parts = path.split('.');

  return {
    object: parts[0], // e.g., "order"
    path, // e.g., "order.status.stage.changed"
    value, // e.g., "InProgress"
    isStageChange: path === 'order.status.stage.changed',
    isShipment: path.includes('shipment'),
  };
}

/**
 * Map Prodigi order stage to internal OrderStatus
 */
function mapProdigiStageToStatus(stage: string): OrderStatus {
  switch (stage) {
    case 'InProgress':
      return OrderStatus.PENDING;
    case 'Complete':
      return OrderStatus.COMPLETED;
    case 'Cancelled':
      return OrderStatus.CANCELED;
    default:
      console.warn('[Prodigi Webhook] Unknown stage:', stage);
      return OrderStatus.PENDING;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const event: ProdigiCloudEvent = JSON.parse(body);

    console.log('[Prodigi Webhook] Received event:', {
      id: event.id,
      type: event.type,
      subject: event.subject,
      stage: event.data.order.status.stage,
      details: event.data.order.status.details,
    });

    // Validate CloudEvents format
    if (event.specversion !== '1.0') {
      console.error('[Prodigi Webhook] Invalid CloudEvents version:', event.specversion);
      return NextResponse.json(
        { error: 'Invalid CloudEvents version' },
        { status: 400 }
      );
    }

    // Parse event type
    const eventInfo = parseEventType(event.type);
    if (!eventInfo) {
      console.error('[Prodigi Webhook] Invalid event type format:', event.type);
      return NextResponse.json(
        { error: 'Invalid event type format' },
        { status: 400 }
      );
    }

    // Extract Prodigi order ID from subject
    const prodigiOrderId = event.subject;
    if (!prodigiOrderId || !prodigiOrderId.startsWith('ord_')) {
      console.error('[Prodigi Webhook] Invalid order ID in subject:', event.subject);
      return NextResponse.json(
        { error: 'Invalid order ID in subject' },
        { status: 400 }
      );
    }

    // Find order in database
    const order = await prisma.order.findFirst({
      where: { prodigiOrderId },
      include: {
        recipient: true,
        orderItems: true,
      },
    });

    if (!order) {
      console.error('[Prodigi Webhook] Order not found:', prodigiOrderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('[Prodigi Webhook] Found order:', {
      orderId: order.id,
      currentStatus: order.status,
      prodigiOrderId,
    });

    // Handle different event types
    const orderData = event.data.order;
    const updates: any = {
      metadata: {
        ...(order.metadata as object || {}),
        lastProdigiWebhookId: event.id,
        lastProdigiWebhookTime: event.time,
        lastProdigiWebhookType: event.type,
        prodigiStatus: orderData.status,
      },
    };

    // Update order status based on Prodigi stage
    if (eventInfo.isStageChange) {
      const newStatus = mapProdigiStageToStatus(eventInfo.value);

      console.log('[Prodigi Webhook] Stage changed:', {
        orderId: order.id,
        oldStatus: order.status,
        newStatus,
        prodigiStage: eventInfo.value,
      });

      updates.status = newStatus;

      // If order is complete, record completion time
      if (newStatus === OrderStatus.COMPLETED) {
        updates.metadata.completedAt = new Date().toISOString();
      }

      // If order is cancelled, record cancellation time
      if (newStatus === OrderStatus.CANCELED) {
        updates.metadata.cancelledAt = new Date().toISOString();
      }
    }

    // Handle shipment information
    if (orderData.shipments && orderData.shipments.length > 0) {
      console.log('[Prodigi Webhook] Shipments received:', {
        orderId: order.id,
        shipmentCount: orderData.shipments.length,
      });

      // Store shipment details in metadata
      updates.metadata.shipments = orderData.shipments.map((shipment: any) => ({
        id: shipment.id,
        carrier: shipment.carrier?.name,
        service: shipment.carrier?.service,
        trackingNumber: shipment.tracking?.number,
        trackingUrl: shipment.tracking?.url,
        dispatchDate: shipment.dispatchDate,
        itemIds: shipment.items?.map((item: any) => item.id) || [],
      }));

      // Create or update shipment records in database
      for (const shipment of orderData.shipments) {
        try {
          await prisma.shipment.upsert({
            where: {
              prodigiShipmentId: shipment.id,
            },
            create: {
              orderId: order.id,
              prodigiShipmentId: shipment.id,
              carrier: shipment.carrier?.name || 'Unknown',
              service: shipment.carrier?.service || 'Standard',
              trackingNumber: shipment.tracking?.number,
              trackingUrl: shipment.tracking?.url,
              shippedAt: shipment.dispatchDate ? new Date(shipment.dispatchDate) : new Date(),
              items: shipment.items || [],
            },
            update: {
              carrier: shipment.carrier?.name || 'Unknown',
              service: shipment.carrier?.service || 'Standard',
              trackingNumber: shipment.tracking?.number,
              trackingUrl: shipment.tracking?.url,
              shippedAt: shipment.dispatchDate ? new Date(shipment.dispatchDate) : new Date(),
              items: shipment.items || [],
            },
          });

          console.log('[Prodigi Webhook] Shipment saved:', {
            orderId: order.id,
            shipmentId: shipment.id,
            trackingNumber: shipment.tracking?.number,
          });
        } catch (shipmentError) {
          console.error('[Prodigi Webhook] Failed to save shipment:', {
            error: shipmentError,
            shipmentId: shipment.id,
          });
        }
      }
    }

    // Handle issues/errors
    if (orderData.status.issues && orderData.status.issues.length > 0) {
      console.warn('[Prodigi Webhook] Order has issues:', {
        orderId: order.id,
        issues: orderData.status.issues,
      });

      updates.metadata.issues = orderData.status.issues.map((issue: any) => ({
        objectId: issue.objectId,
        errorCode: issue.errorCode,
        description: issue.description,
        timestamp: new Date().toISOString(),
        authorisationDetails: issue.authorisationDetails,
      }));

      // Log critical issues
      for (const issue of orderData.status.issues) {
        if (issue.errorCode.includes('Failed') || issue.errorCode.includes('Error')) {
          console.error('[Prodigi Webhook] Critical issue:', {
            orderId: order.id,
            errorCode: issue.errorCode,
            description: issue.description,
          });

          // Create error log
          try {
            await prisma.orderProcessingError.create({
              data: {
                orderId: order.id,
                error: `${issue.errorCode}: ${issue.description}`,
                retryCount: 0,
                lastAttempt: new Date(),
              },
            });
          } catch (logError) {
            console.error('[Prodigi Webhook] Failed to log error:', logError);
          }
        }
      }
    }

    // Update order in database
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updates,
    });

    console.log('[Prodigi Webhook] Order updated successfully:', {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      eventId: event.id,
    });

    // Return success response
    return NextResponse.json({
      received: true,
      orderId: order.id,
      eventId: event.id,
      eventType: event.type,
      stage: orderData.status.stage,
      updated: true,
    });
  } catch (error) {
    console.error('[Prodigi Webhook] Error processing webhook:', error);

    // Return 200 to prevent Prodigi from retrying (we've logged the error)
    // If we return 500, Prodigi will retry which may cause duplicate processing
    return NextResponse.json(
      {
        received: true,
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 } // Return 200 to acknowledge receipt
    );
  }
}
