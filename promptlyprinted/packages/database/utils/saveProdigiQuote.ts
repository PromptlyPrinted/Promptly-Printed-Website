import { PrismaClient } from '@prisma/client';
import { ProdigiQuoteResponse } from './getProdigiQuote.js';

const prisma = new PrismaClient();

interface ProdigiShipment {
  carrier: {
    name: string;
    service: string;
  };
  fulfillmentLocation: {
    countryCode: string;
    labCode: string;
  };
  cost: {
    amount: string;
    currency: string;
  };
  items: string[];
}

interface ProdigiItem {
  id: string;
  sku: string;
  copies: number;
  unitCost: {
    amount: string;
    currency: string;
  };
  attributes: Record<string, any>;
  assets: Array<{
    printArea: string;
  }>;
}

export async function saveProdigiQuote(quoteResponse: ProdigiQuoteResponse) {
  const quote = quoteResponse.quotes[0]; // We usually get one quote per request

  return await prisma.$transaction(async (tx) => {
    // Create costs for the quote summary
    const itemsCost = await tx.cost.create({
      data: {
        amount: quote.costSummary.items.amount,
        currency: quote.costSummary.items.currency,
      },
    });

    const shippingCost = await tx.cost.create({
      data: {
        amount: quote.costSummary.shipping.amount,
        currency: quote.costSummary.shipping.currency,
      },
    });

    // Create the cost summary
    const costSummary = await tx.quoteCostSummary.create({
      data: {
        itemsCostId: itemsCost.id,
        shippingCostId: shippingCost.id,
      },
    });

    // Create the quote
    const savedQuote = await tx.quote.create({
      data: {
        shipmentMethod: quote.shipmentMethod.toUpperCase(),
        destinationCountryCode: 'US', // This needs to be passed from the request
        currencyCode: quote.costSummary.items.currency,
        costSummaryId: costSummary.id,
        // Add shipments
        shipments: {
          create: quote.shipments.map((shipment: ProdigiShipment) => ({
            carrierName: shipment.carrier.name,
            carrierService: shipment.carrier.service,
            itemIds: shipment.items,
            cost: {
              create: {
                amount: shipment.cost.amount,
                currency: shipment.cost.currency,
              },
            },
            fulfillmentLocation: {
              create: {
                countryCode: shipment.fulfillmentLocation.countryCode,
                labCode: shipment.fulfillmentLocation.labCode,
              },
            },
          })),
        },
        // Add items
        items: {
          create: quote.items.map((item: ProdigiItem) => ({
            itemId: item.id,
            sku: item.sku,
            copies: item.copies,
            attributes: item.attributes,
            assets: item.assets,
            unitCost: {
              create: {
                amount: item.unitCost.amount,
                currency: item.unitCost.currency,
              },
            },
          })),
        },
      },
      include: {
        costSummary: {
          include: {
            items: true,
            shipping: true,
          },
        },
        shipments: {
          include: {
            cost: true,
            fulfillmentLocation: true,
          },
        },
        items: {
          include: {
            unitCost: true,
          },
        },
      },
    });

    return savedQuote;
  });
} 
