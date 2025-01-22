import { ShippingMethod } from '@prisma/client';

interface ProdigiQuoteItem {
  sku: string;
  copies: number;
  attributes?: Record<string, any>;
  assets: Array<{ printArea: string }>;
}

interface ProdigiQuoteRequest {
  shippingMethod?: string;
  destinationCountryCode: string;
  currencyCode?: string;
  items: ProdigiQuoteItem[];
}

export interface ProdigiQuoteResponse {
  outcome: string;
  quotes: Array<{
    shipmentMethod: string;
    costSummary: {
      items: {
        amount: string;
        currency: string;
      };
      shipping: {
        amount: string;
        currency: string;
      };
    };
    shipments: Array<{
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
    }>;
    items: Array<{
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
    }>;
  }>;
}

export async function getProdigiQuote({
  shippingMethod,
  destinationCountryCode,
  currencyCode = 'USD',
  items
}: ProdigiQuoteRequest): Promise<ProdigiQuoteResponse> {
  const apiKey = process.env.PRODIGI_API_KEY;
  if (!apiKey) {
    throw new Error('PRODIGI_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.prodigi.com/v4.0/quotes', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shippingMethod: shippingMethod?.toLowerCase(),
      destinationCountryCode,
      currencyCode,
      items,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get Prodigi quote: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Helper function to convert our ShippingMethod enum to Prodigi's format
export function convertShippingMethodToProdigi(method: ShippingMethod): string {
  return method.toLowerCase();
}

// Helper function to convert Prodigi's shipping method to our enum
export function convertProdigiToShippingMethod(method: string): ShippingMethod {
  return method.toUpperCase() as ShippingMethod;
} 