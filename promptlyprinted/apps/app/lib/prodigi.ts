const PRODIGI_API = process.env.PRODIGI_API || 'https://api.prodigi.com/v4.0';
const PRODIGI_API_KEY = process.env.PRODIGI_API_KEY;

// Enhanced debug logging
console.log('Prodigi Configuration:', {
  api: PRODIGI_API,
  keyExists: !!PRODIGI_API_KEY,
  keyLength: PRODIGI_API_KEY?.length,
  rawApiEnv: process.env.PRODIGI_API,
  rawKeyEnv: process.env.PRODIGI_API_KEY?.substring(0, 4) + '...',
  nodeEnv: process.env.NODE_ENV,
});

interface ProdigiProduct {
  sku: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  productDimensions: {
    width: number;
    height: number;
    units: string;
  };
  attributes: {
    edge?: string[];
    frame?: string[];
    paperType?: string[];
    substrateWeight?: string[];
    wrap?: string[];
    [key: string]: string[] | undefined;
  };
  printAreas: {
    default: {
      required: boolean;
    };
    [key: string]: {
      required: boolean;
    };
  };
  variants: Array<{
    attributes: {
      edge?: string;
      frame?: string;
      paperType?: string;
      substrateWeight?: string;
      wrap?: string;
      [key: string]: string | undefined;
    };
    shipsTo: string[];
    printAreaSizes: {
      default: {
        horizontalResolution: number;
        verticalResolution: number;
      };
      [key: string]: {
        horizontalResolution: number;
        verticalResolution: number;
      };
    };
  }>;
}

export async function getProdigiProducts() {
  if (!PRODIGI_API_KEY) {
    throw new Error('Prodigi API key not configured');
  }

  try {
    console.log('Fetching from:', `${PRODIGI_API}/products/catalogue`);
    const response = await fetch(`${PRODIGI_API}/products/catalogue`, {
      headers: {
        'X-API-Key': PRODIGI_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prodigi API Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Prodigi API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    if (!data.products) {
      console.error('Unexpected Prodigi API response:', data);
      throw new Error('Unexpected Prodigi API response format');
    }
    return data.products as ProdigiProduct[];
  } catch (error) {
    console.error('[PRODIGI_GET_PRODUCTS]', error);
    throw error;
  }
}

export async function getProdigiProduct(sku: string) {
  if (!PRODIGI_API_KEY) {
    throw new Error('Prodigi API key not configured');
  }

  try {
    console.log('Fetching from:', `${PRODIGI_API}/products/catalogue/${sku}`);
    const response = await fetch(`${PRODIGI_API}/products/catalogue/${sku}`, {
      headers: {
        'X-API-Key': PRODIGI_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prodigi API Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Prodigi API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    if (!data.product) {
      console.error('Unexpected Prodigi API response:', data);
      throw new Error('Unexpected Prodigi API response format');
    }
    return data.product as ProdigiProduct;
  } catch (error) {
    console.error('[PRODIGI_GET_PRODUCT]', error);
    throw error;
  }
}

export async function validateProdigiSku(sku: string): Promise<boolean> {
  if (!PRODIGI_API_KEY) {
    return true; // Skip validation if API key is not configured
  }

  try {
    const response = await fetch(`${PRODIGI_API}/products/catalogue/${sku}`, {
      headers: {
        'X-API-Key': PRODIGI_API_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[PRODIGI_VALIDATE_SKU]', error);
    return false;
  }
}
