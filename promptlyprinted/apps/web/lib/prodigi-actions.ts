import 'server-only';
import { prodigiService } from './prodigi';
import { prisma } from '@repo/database';
import { OrderStatus } from '@repo/database';
import { processFullRefund, processPartialRefund } from './square-refunds';

export interface ProdigiActionAvailability {
  cancel?: {
    isAvailable: 'Yes' | 'No';
    reason?: string;
  };
  changeRecipientDetails?: {
    isAvailable: 'Yes' | 'No';
    reason?: string;
  };
  changeShippingMethod?: {
    isAvailable: 'Yes' | 'No';
    reason?: string;
  };
  updateMetadata?: {
    isAvailable: 'Yes' | 'No';
    reason?: string;
  };
}

/**
 * Check which actions are available for a Prodigi order
 */
export async function checkOrderActions(
  prodigiOrderId: string
): Promise<ProdigiActionAvailability> {
  try {
    const response = await fetch(
      `https://api.prodigi.com/v4.0/orders/${prodigiOrderId}/actions`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.PRODIGI_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check order actions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.actions || {};
  } catch (error) {
    console.error('[Prodigi Actions] Failed to check order actions:', error);
    throw error;
  }
}

/**
 * Cancel an order with full refund
 */
export async function cancelOrderWithRefund(orderId: number): Promise<{
  success: boolean;
  refundId?: string;
  message: string;
}> {
  console.log('[Prodigi Actions] Cancelling order with refund:', orderId);

  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        recipient: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.prodigiOrderId) {
      throw new Error('Order does not have a Prodigi order ID');
    }

    if (order.status === OrderStatus.CANCELED) {
      throw new Error('Order is already cancelled');
    }

    // Check if cancellation is available
    const actions = await checkOrderActions(order.prodigiOrderId);
    if (actions.cancel?.isAvailable !== 'Yes') {
      throw new Error(
        actions.cancel?.reason ||
          'Order cannot be cancelled at this time (may already be in production)'
      );
    }

    // Cancel the Prodigi order
    console.log('[Prodigi Actions] Cancelling Prodigi order:', order.prodigiOrderId);
    await prodigiService.cancelOrder(order.prodigiOrderId);

    // Get Square payment ID from metadata
    const metadata = order.metadata as any;
    const squarePaymentId = metadata?.squarePaymentId;

    if (!squarePaymentId) {
      throw new Error('No Square payment ID found in order metadata');
    }

    // Process full refund in Square
    console.log('[Prodigi Actions] Processing Square refund for payment:', squarePaymentId);
    const refund = await processFullRefund({
      paymentId: squarePaymentId,
      amount: order.totalPrice,
      currency: 'USD',
      reason: 'Customer requested order cancellation',
      orderId: order.id,
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELED,
        metadata: {
          ...metadata,
          cancelledAt: new Date().toISOString(),
          refundId: refund.refundId,
        },
      },
    });

    console.log('[Prodigi Actions] Order cancelled successfully:', {
      orderId,
      refundId: refund.refundId,
    });

    return {
      success: true,
      refundId: refund.refundId,
      message: 'Order cancelled successfully. Refund will be processed in 5-10 business days.',
    };
  } catch (error) {
    console.error('[Prodigi Actions] Failed to cancel order:', error);
    throw error;
  }
}

/**
 * Update shipping address for an order
 */
export async function updateShippingAddress(
  orderId: number,
  newAddress: {
    name: string;
    email?: string;
    phoneNumber?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    countryCode: string;
  }
): Promise<{ success: boolean; message: string }> {
  console.log('[Prodigi Actions] Updating shipping address:', orderId);

  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        recipient: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.prodigiOrderId) {
      throw new Error('Order does not have a Prodigi order ID');
    }

    if (!order.recipient) {
      throw new Error('Order does not have recipient information');
    }

    // Validate that zip code hasn't changed (to avoid tax issues)
    if (order.recipient.postalCode !== newAddress.postalCode) {
      throw new Error(
        'Cannot change postal/zip code. Please cancel and create a new order if you need to ship to a different location.'
      );
    }

    // Check if address update is available
    const actions = await checkOrderActions(order.prodigiOrderId);
    if (actions.changeRecipientDetails?.isAvailable !== 'Yes') {
      throw new Error(
        actions.changeRecipientDetails?.reason ||
          'Address cannot be updated at this time (order may already be in production)'
      );
    }

    // Update address in Prodigi
    console.log('[Prodigi Actions] Updating Prodigi recipient:', order.prodigiOrderId);
    await prodigiService.updateRecipient(order.prodigiOrderId, {
      name: newAddress.name,
      email: newAddress.email || order.recipient.email || '',
      phoneNumber: newAddress.phoneNumber,
      address: {
        line1: newAddress.addressLine1,
        line2: newAddress.addressLine2,
        postalOrZipCode: newAddress.postalCode,
        countryCode: newAddress.countryCode,
        townOrCity: newAddress.city,
        stateOrCounty: newAddress.state,
      },
    });

    // Update address in database
    await prisma.recipient.update({
      where: { id: order.recipient.id },
      data: {
        name: newAddress.name,
        email: newAddress.email,
        phoneNumber: newAddress.phoneNumber,
        addressLine1: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        countryCode: newAddress.countryCode,
      },
    });

    console.log('[Prodigi Actions] Address updated successfully:', orderId);

    return {
      success: true,
      message: 'Shipping address updated successfully',
    };
  } catch (error) {
    console.error('[Prodigi Actions] Failed to update address:', error);
    throw error;
  }
}

/**
 * Downgrade shipping method (cheaper shipping with partial refund)
 */
export async function downgradeShipping(
  orderId: number,
  newMethod: 'Budget' | 'Standard' | 'Express' | 'Overnight'
): Promise<{
  success: boolean;
  refundAmount?: number;
  refundId?: string;
  message: string;
}> {
  console.log('[Prodigi Actions] Downgrading shipping method:', {
    orderId,
    newMethod,
  });

  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.prodigiOrderId) {
      throw new Error('Order does not have a Prodigi order ID');
    }

    if (!order.shippingMethod) {
      throw new Error('Order does not have a shipping method');
    }

    // Define shipping costs (these should ideally come from a pricing table)
    const shippingCosts: Record<string, number> = {
      Budget: 5.0,
      Standard: 10.0,
      Express: 20.0,
      Overnight: 35.0,
    };

    const currentCost = shippingCosts[order.shippingMethod] || 0;
    const newCost = shippingCosts[newMethod] || 0;

    // Ensure it's a downgrade (cheaper)
    if (newCost >= currentCost) {
      throw new Error(
        'New shipping method must be cheaper than current method. Upgrades are not supported.'
      );
    }

    const refundAmount = currentCost - newCost;

    // Check if shipping method update is available
    const actions = await checkOrderActions(order.prodigiOrderId);
    if (actions.changeShippingMethod?.isAvailable !== 'Yes') {
      throw new Error(
        actions.changeShippingMethod?.reason ||
          'Shipping method cannot be changed at this time (order may already be in production)'
      );
    }

    // Update shipping method in Prodigi
    console.log('[Prodigi Actions] Updating Prodigi shipping method:', {
      prodigiOrderId: order.prodigiOrderId,
      newMethod,
    });
    await prodigiService.updateShippingMethod(order.prodigiOrderId, newMethod);

    // Get Square payment ID from metadata
    const metadata = order.metadata as any;
    const squarePaymentId = metadata?.squarePaymentId;

    if (!squarePaymentId) {
      throw new Error('No Square payment ID found in order metadata');
    }

    // Process partial refund in Square
    console.log('[Prodigi Actions] Processing partial refund:', {
      paymentId: squarePaymentId,
      refundAmount,
    });
    const refund = await processPartialRefund({
      paymentId: squarePaymentId,
      amount: refundAmount,
      currency: 'USD',
      reason: `Shipping method changed from ${order.shippingMethod} to ${newMethod}`,
      orderId: order.id,
    });

    // Update order in database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingMethod: newMethod as any,
        metadata: {
          ...metadata,
          shippingMethodChangedAt: new Date().toISOString(),
          previousShippingMethod: order.shippingMethod,
          shippingRefundId: refund.refundId,
          shippingRefundAmount: refundAmount,
        },
      },
    });

    console.log('[Prodigi Actions] Shipping method downgraded successfully:', {
      orderId,
      refundId: refund.refundId,
      refundAmount,
    });

    return {
      success: true,
      refundAmount,
      refundId: refund.refundId,
      message: `Shipping method updated. A refund of $${refundAmount.toFixed(2)} will be processed in 5-10 business days.`,
    };
  } catch (error) {
    console.error('[Prodigi Actions] Failed to downgrade shipping:', error);
    throw error;
  }
}

/**
 * Update order metadata
 */
export async function updateOrderMetadata(
  orderId: number,
  metadata: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  console.log('[Prodigi Actions] Updating order metadata:', orderId);

  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.prodigiOrderId) {
      throw new Error('Order does not have a Prodigi order ID');
    }

    // Update metadata in Prodigi
    const response = await fetch(
      `https://api.prodigi.com/v4.0/orders/${order.prodigiOrderId}/actions/updateMetadata`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.PRODIGI_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update metadata: ${response.statusText}`);
    }

    // Update metadata in database
    const currentMetadata = (order.metadata as any) || {};
    await prisma.order.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...currentMetadata,
          ...metadata,
          metadataUpdatedAt: new Date().toISOString(),
        },
      },
    });

    console.log('[Prodigi Actions] Metadata updated successfully:', orderId);

    return {
      success: true,
      message: 'Order metadata updated successfully',
    };
  } catch (error) {
    console.error('[Prodigi Actions] Failed to update metadata:', error);
    throw error;
  }
}
