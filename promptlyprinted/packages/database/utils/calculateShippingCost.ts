import { PrismaClient, type ShippingMethod } from '@prisma/client';

const prisma = new PrismaClient();

export async function calculateShippingCost(
  method: ShippingMethod,
  itemCount: number,
  currency = 'USD'
): Promise<number> {
  try {
    // Get the shipping price for the specified method and currency
    const shippingPrice = await prisma.shippingPrice.findUnique({
      where: {
        method_currency: {
          method,
          currency,
        },
      },
    });

    if (!shippingPrice) {
      throw new Error(
        `No shipping price found for method ${method} and currency ${currency}`
      );
    }

    // Calculate total shipping cost
    // Base price + (additional item price * (number of items - 1))
    const totalShippingCost =
      shippingPrice.basePrice +
      shippingPrice.additionalItemPrice * Math.max(0, itemCount - 1);

    // Round to 2 decimal places
    return Math.round(totalShippingCost * 100) / 100;
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    throw error;
  }
}
