import { env } from '@repo/env';

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

class ProdigiService {
  private apiKey: string;
  private baseUrl: string;
  private headers: HeadersInit;

  private normalizeAssetUrl(rawUrl: string) {
    if (!rawUrl) {
      throw new Error('Received empty asset URL');
    }

    console.log('Normalizing asset URL:', rawUrl);

    // Prodigi does NOT accept data URIs - they need publicly accessible HTTP/HTTPS URLs
    if (rawUrl.startsWith('data:image')) {
      throw new Error(
        'Prodigi API does not accept base64/data URI images. Images must be uploaded to a publicly accessible URL first. ' +
        'Please ensure images are saved to file storage and converted to public URLs before sending to Prodigi.'
      );
    }

    let absoluteUrl = rawUrl;

    // Convert relative URLs to absolute
    if (rawUrl.startsWith('/')) {
      // In production, use the Vercel URL; in development, use the configured public URL
      const base = env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
        : env.NEXT_PUBLIC_WEB_URL;

      if (!base) {
        throw new Error(
          `Cannot resolve relative asset URL "${rawUrl}" because NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL (or fallback NEXT_PUBLIC_WEB_URL) is not configured`
        );
      }
      absoluteUrl = new URL(rawUrl, base).toString();
    }

    let parsed: URL;
    try {
      parsed = new URL(absoluteUrl);
    } catch (error) {
      throw new Error(
        `Invalid asset URL "${rawUrl}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(
        `Prodigi requires HTTP/HTTPS asset URLs. Received "${parsed.protocol}" for "${parsed.href}"`
      );
    }

    // Check for localhost URLs - Prodigi cannot access these
    // This should be caught earlier in the flow, but double-check here
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      console.error(
        `ERROR: Localhost URL detected: ${parsed.href}. ` +
        `This should have been replaced with a test image earlier in the flow.`
      );
      throw new Error(
        `Prodigi cannot access localhost URLs ("${parsed.href}"). ` +
        `The application should replace localhost URLs with public test images in development.`
      );
    }

    // Ensure HTTPS for security
    if (parsed.protocol !== 'https:') {
      console.warn(`Converting HTTP to HTTPS for asset URL: ${parsed.href}`);
      parsed.protocol = 'https:';
    }

    const normalizedUrl = parsed.toString();
    console.log('Normalized asset URL:', normalizedUrl);
    return normalizedUrl;
  }

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
        if (!item.assets?.length || !item.assets[0]?.url) {
          throw new Error(`Missing artwork URL for SKU: ${item.sku}`);
        }
        return {
          ...item,
          assets: item.assets.map((asset) => ({
            ...asset,
            url: this.normalizeAssetUrl(asset.url),
          })),
          sizing: item.sizing || 'fillPrintArea',
        };
      })
    );

    console.log('Prepared Prodigi order payload items:', {
      items: items.map((item) => ({
        sku: item.sku,
        assets: item.assets.map((asset) => ({
          printArea: asset.printArea,
          url: asset.url,
          urlType: typeof asset.url,
        })),
      })),
    });

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

// Lazy singleton initialization to avoid module evaluation errors during build
let _prodigiService: ProdigiService | null = null;

function getProdigiService(): ProdigiService {
  if (!_prodigiService) {
    _prodigiService = new ProdigiService();
  }
  return _prodigiService;
}

// Export a proxy that lazily initializes the service
export const prodigiService = new Proxy({} as ProdigiService, {
  get(_target, prop) {
    const service = getProdigiService();
    const value = (service as any)[prop];
    if (typeof value === 'function') {
      return value.bind(service);
    }
    return value;
  },
});
