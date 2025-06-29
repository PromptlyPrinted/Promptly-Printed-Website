import { env } from '@repo/env';
import { generateHighResImage, getImageSpecForSku } from './imageSpecs';

interface ProdigiQuoteItem {
  sku: string;
  copies: number;
  attributes?: Record<string, any>;
  assets: Array<{
    printArea: string;
    url?: string;
  }>;
}

interface ProdigiQuoteRequest {
  shippingMethod?: 'Budget' | 'Standard' | 'Express' | 'Overnight';
  destinationCountryCode: string;
  currencyCode?: string;
  items: ProdigiQuoteItem[];
}

interface ProdigiCost {
  amount: string;
  currency: string;
}

interface ProdigiQuoteResponse {
  outcome: string;
  quotes: Array<{
    shipmentMethod: string;
    costSummary: {
      items: ProdigiCost;
      shipping: ProdigiCost;
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
      cost: ProdigiCost;
      items: string[];
    }>;
    items: Array<{
      id: string;
      sku: string;
      copies: number;
      unitCost: ProdigiCost;
      attributes: Record<string, any>;
      assets: Array<{
        printArea: string;
      }>;
    }>;
  }>;
}

interface ProdigiOrderRequest {
  shippingMethod: 'Budget' | 'Standard' | 'Express' | 'Overnight';
  recipient: {
    name: string;
    email: string;
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
  items: Array<{
    sku: string;
    copies: number;
    merchantReference?: string;
    sizing?: 'fillPrintArea' | 'fitPrintArea';
    assets: Array<{
      printArea: string;
      url: string;
    }>;
  }>;
  merchantReference?: string;
  idempotencyKey?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

interface ProdigiOrderItem {
  sku: string;
  copies: number;
  artworkUrl: string; // URL to the original artwork
  mockupUrl: string; // URL to the mockup image (for display only)
}

class ProdigiService {
  private apiKey: string;
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    console.log('Initializing ProdigiService with environment:', {
      hasEnv: !!env,
      prodigiApiKey: env.PRODIGI_API_KEY ? '***' : 'missing',
      prodigiApiKeyLength: env.PRODIGI_API_KEY?.length,
      envKeys: Object.keys(env),
      processEnvKeys: Object.keys(process.env).filter((key) =>
        key.includes('PRODIGI')
      ),
    });

    if (!env.PRODIGI_API_KEY) {
      console.error('PRODIGI_API_KEY is missing from environment variables');
      throw new Error(
        'PRODIGI_API_KEY is required but not found in environment variables'
      );
    }

    this.apiKey = env.PRODIGI_API_KEY;
    this.baseUrl = 'https://api.prodigi.com/v4.0';
    this.headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
    console.log('Initialized ProdigiService:', {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length,
      headers: {
        ...this.headers,
        'X-API-Key': this.apiKey ? '***' : 'missing',
      },
    });
  }

  private async prepareItemWithHighResImage(item: ProdigiOrderItem) {
    const spec = getImageSpecForSku(item.sku);
    if (!spec) {
      throw new Error(`No image specifications found for SKU: ${item.sku}`);
    }

    // If the image is already a high-res base64 image, use it directly
    if (item.artworkUrl.startsWith('data:image')) {
      return {
        sku: item.sku,
        copies: item.copies,
        assets: [
          {
            printArea: 'default',
            url: item.artworkUrl,
          },
        ],
      };
    }

    // Otherwise, generate high-res version of the artwork
    const highResUrl = await generateHighResImage(item.artworkUrl, spec);

    return {
      sku: item.sku,
      copies: item.copies,
      assets: [
        {
          printArea: 'default',
          url: highResUrl,
        },
      ],
    };
  }

  async getQuote(request: ProdigiQuoteRequest): Promise<ProdigiQuoteResponse> {
    const response = await fetch(`${this.baseUrl}/quotes`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.statusText}`);
    }

    return response.json();
  }

  async createOrder(request: ProdigiOrderRequest) {
    console.log('Creating Prodigi order with request:', {
      ...request,
      items: request.items.map((item) => ({
        ...item,
        assets: item.assets.map((asset) => ({
          ...asset,
          url: asset.url.substring(0, 50) + '...', // Truncate URL for logging
        })),
      })),
    });

    // Ensure all items have artwork URLs
    const items = await Promise.all(
      request.items.map(async (item) => {
        if (!item.assets[0]?.url) {
          throw new Error(`Missing artwork URL for SKU: ${item.sku}`);
        }
        return {
          ...item,
          sizing: item.sizing || 'fillPrintArea',
        };
      })
    );

    console.log('Sending request to Prodigi API:', {
      url: `${this.baseUrl}/orders`,
      method: 'POST',
      headers: {
        ...this.headers,
        'X-API-Key': '***', // Hide API key in logs
      },
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length,
      requestBody: {
        ...request,
        items: items.map((item) => ({
          ...item,
          assets: item.assets.map((asset) => ({
            ...asset,
            url: asset.url.substring(0, 50) + '...', // Truncate URL for logging
          })),
        })),
      },
    });

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        ...this.headers,
        ...(request.idempotencyKey && {
          'Idempotency-Key': request.idempotencyKey,
        }),
      },
      body: JSON.stringify({
        ...request,
        items,
        callbackUrl:
          request.callbackUrl || process.env.NEXT_PUBLIC_PRODIGI_WEBHOOK_URL,
      }),
    });

    console.log('Prodigi API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Prodigi API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        requestUrl: `${this.baseUrl}/orders`,
        hasApiKey: !!this.apiKey,
        apiKeyLength: this.apiKey?.length,
      });
      throw new Error(
        `Failed to create order: ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ''
        }`
      );
    }

    const data = await response.json();
    console.log('Successfully created Prodigi order:', {
      id: data.id,
      status: data.status,
    });
    return data;
  }

  async getOrder(prodigiOrderId: string) {
    const response = await fetch(`${this.baseUrl}/orders/${prodigiOrderId}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get order: ${response.statusText}`);
    }

    return response.json();
  }

  async updateRecipient(
    prodigiOrderId: string,
    recipient: ProdigiOrderRequest['recipient']
  ) {
    const response = await fetch(
      `${this.baseUrl}/orders/${prodigiOrderId}/actions/updateRecipient`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ recipient }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update recipient: ${response.statusText}`);
    }

    return response.json();
  }

  async cancelOrder(prodigiOrderId: string) {
    const response = await fetch(
      `${this.baseUrl}/orders/${prodigiOrderId}/actions/cancel`,
      {
        method: 'POST',
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }

    return response.json();
  }

  async updateShippingMethod(prodigiOrderId: string, shippingMethod: string) {
    const response = await fetch(
      `${this.baseUrl}/orders/${prodigiOrderId}/actions/updateShippingMethod`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ shippingMethod }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update shipping method: ${response.statusText}`
      );
    }

    return response.json();
  }
}

// Create a singleton instance
export const prodigiService = new ProdigiService();
