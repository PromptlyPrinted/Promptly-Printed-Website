// Define supported currencies type
type SupportedCurrency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'CHF'
  | 'SEK'
  | 'AED'
  | 'DKK'
  | 'NOK'
  | 'NZD'
  | 'KRW'
  | 'JPY'
  | 'SGD'
  | 'CNY';

// Define exchange rates (these should be updated regularly in production)
const exchangeRates: Record<SupportedCurrency, number> = {
  USD: 1, // Base currency
  EUR: 0.92, // Euro
  GBP: 0.79, // British Pound
  AUD: 1.52, // Australian Dollar
  CHF: 0.89, // Swiss Franc
  SEK: 10.45, // Swedish Krona
  AED: 3.67, // UAE Dirham
  DKK: 6.86, // Danish Krone
  NOK: 10.58, // Norwegian Krone
  NZD: 1.65, // New Zealand Dollar
  KRW: 1335.5, // South Korean Won
  JPY: 150.55, // Japanese Yen
  SGD: 1.34, // Singapore Dollar
  CNY: 7.23, // Chinese Yuan
};

// Helper function to convert USD to other currencies
function convertFromUSD(
  amount: number,
  targetCurrency: SupportedCurrency
): number {
  const rate = exchangeRates[targetCurrency];
  if (!rate) throw new Error(`Unsupported currency: ${targetCurrency}`);

  // Round to 2 decimal places, except JPY and KRW which don't use decimals
  if (targetCurrency === 'JPY' || targetCurrency === 'KRW') {
    return Math.round(amount * rate);
  }
  return Math.round(amount * rate * 100) / 100;
}

// Helper function to generate pricing array from USD base price
function generatePricingArray(
  basePrice: number
): Array<{ currency: string; amount: number; regions: string[] }> {
  return [
    {
      currency: 'USD',
      amount: basePrice,
      regions: ['US'],
    },
    {
      currency: 'EUR',
      amount: convertFromUSD(basePrice, 'EUR'),
      regions: [
        'DE',
        'FR',
        'ES',
        'IT',
        'NL',
        'IE',
        'BE',
        'AT',
        'PT',
        'FI',
        'GR',
      ],
    },
    {
      currency: 'GBP',
      amount: convertFromUSD(basePrice, 'GBP'),
      regions: ['GB'],
    },
    {
      currency: 'AUD',
      amount: convertFromUSD(basePrice, 'AUD'),
      regions: ['AU'],
    },
    {
      currency: 'CHF',
      amount: convertFromUSD(basePrice, 'CHF'),
      regions: ['CH'],
    },
    {
      currency: 'SEK',
      amount: convertFromUSD(basePrice, 'SEK'),
      regions: ['SE'],
    },
    {
      currency: 'AED',
      amount: convertFromUSD(basePrice, 'AED'),
      regions: ['AE'],
    },
    {
      currency: 'DKK',
      amount: convertFromUSD(basePrice, 'DKK'),
      regions: ['DK'],
    },
    {
      currency: 'NOK',
      amount: convertFromUSD(basePrice, 'NOK'),
      regions: ['NO'],
    },
    {
      currency: 'NZD',
      amount: convertFromUSD(basePrice, 'NZD'),
      regions: ['NZ'],
    },
    {
      currency: 'KRW',
      amount: convertFromUSD(basePrice, 'KRW'),
      regions: ['KR'],
    },
    {
      currency: 'JPY',
      amount: convertFromUSD(basePrice, 'JPY'),
      regions: ['JP'],
    },
    {
      currency: 'SGD',
      amount: convertFromUSD(basePrice, 'SGD'),
      regions: ['SG'],
    },
    {
      currency: 'CNY',
      amount: convertFromUSD(basePrice, 'CNY'),
      regions: ['CN'],
    },
  ];
}

export interface ProductDetails {
  sku: string;
  name: string;
  shortDescription: string;
  features: string[];
  manufacturingLocation: string;
  materials: string[];
  ecoProperties: string[];
  careInstructions: string[];
  pdfUrl: string;
  size: string[];
  productType: string;
  category: string;
  imageUrls: {
    base: string;
    productImage?: string;
    front?: string;
    back?: string;
    closeup?: string;
    lifestyle?: string;
  };
  colorOptions: Array<{
    name: string;
    filename: string;
  }>;
  brand: {
    name: string;
    identifier: string;
  };
  identifiers: {
    mpn: string;
    gtin?: string;
  };
  availability: string;
  dimensions: {
    width: number;
    height: number;
    units: string;
  };
  weight: {
    value: number;
    units: string;
  };
  pricing: Array<{
    currency: string;
    amount: number;
    regions: string[];
  }>;
  shippingZones: {
    [key: string]: {
      countries: string[];
      standardShipping: {
        cost: number;
        currency: string;
        estimatedDays: string;
      };
      expressShipping: {
        cost: number;
        currency: string;
        estimatedDays: string;
      };
    };
  };
  vatIncluded: boolean;
  customsDutyInfo: {
    [key: string]: string;
  };
  restrictions: {
    excludedCountries: string[];
    maxQuantityPerOrder: number;
  };
}

// Define base shipping zones to reuse
const baseShippingZones = {
  EU: {
    countries: [
      'DE',
      'FR',
      'IT',
      'ES',
      'NL',
      'BE',
      'IE',
      'AT',
      'PT',
      'FI',
      'GR',
    ],
    standardShipping: {
      cost: 0,
      currency: 'EUR',
      estimatedDays: '5-7',
    },
    expressShipping: {
      cost: convertFromUSD(10, 'EUR'),
      currency: 'EUR',
      estimatedDays: '1-6',
    },
  },
  UK: {
    countries: ['GB'],
    standardShipping: {
      cost: 0,
      currency: 'GBP',
      estimatedDays: '2-3',
    },
    expressShipping: {
      cost: convertFromUSD(10, 'GBP'),
      currency: 'GBP',
      estimatedDays: '1-2',
    },
  },
  US: {
    countries: ['US'],
    standardShipping: {
      cost: 0,
      currency: 'USD',
      estimatedDays: '4-6',
    },
    expressShipping: {
      cost: 10,
      currency: 'USD',
      estimatedDays: '1-3',
    },
  },
  APAC: {
    countries: ['AU', 'NZ', 'JP', 'KR', 'SG'],
    standardShipping: {
      cost: 0,
      currency: 'USD',
      estimatedDays: '2-5',
    },
    expressShipping: {
      cost: 10,
      currency: 'USD',
      estimatedDays: '1-4',
    },
  },
  ROW: {
    countries: ['CH', 'SE', 'AE', 'DK', 'NO', 'CN'],
    standardShipping: {
      cost: 0,
      currency: 'USD',
      estimatedDays: '10-15',
    },
    expressShipping: {
      cost: 10,
      currency: 'USD',
      estimatedDays: '1-6',
    },
  },
};

// Define base customs duty info to reuse
const baseCustomsDutyInfo = {
  EU: 'VAT included in price for EU countries',
  UK: 'UK VAT (20%) will be calculated at checkout',
  US: 'No additional import duties for orders under $800',
  APAC: 'Import duties may apply, calculated at checkout',
  ROW: 'Import duties may apply, calculated at checkout',
};

// Export the hoodie details for use in other files
export const hoodieDetails: Record<string, ProductDetails> = {
  'A-MH-JH001': {
    sku: 'A-MH-JH001',
    name: "Men's Premium Organic Cotton Hoodie",
    shortDescription:
      'Premium pullover hoodie made from sustainable organic cotton. Comfortable, warm, and eco-friendly with modern fit and quality construction.',
    features: [
      'Classic pullover design with kangaroo pocket',
      'Lined hood with matching drawcords',
      'Ribbed cuffs and hem for perfect fit',
      'Soft brushed fleece interior',
      'Set-in sleeves for comfortable movement',
      'Made with GOTS certified organic cotton',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '85% organic ring-spun combed cotton, 15% recycled polyester',
      '350 GSM fabric weight for premium warmth',
    ],
    ecoProperties: [
      'GOTS certified organic cotton',
      'PETA-approved vegan friendly',
      'Fair Wear Foundation member',
      'Sustainable textile production',
    ],
    careInstructions: [
      'Wash similar colours together',
      'Do not iron on print',
      'Wash and iron inside out',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Stanley%20Stella%20Cruiser%20STSU812.pdf',
    size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    productType: 'HOODIE',
    category: "Men's Hoodies",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/Blanks/png',
      productImage: '/assets/images/Apparel/Mens/Hoodies/A-MH-JH001/ProductImage/image.png',
    },
    colorOptions: [
      { name: 'Black', filename: 'black.png' },
      { name: 'White', filename: 'white.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'Heather Grey', filename: 'heather-grey.png' },
    ],
    brand: {
      name: 'Stanley/Stella',
      identifier: 'SS',
    },
    identifiers: {
      mpn: 'STSU812',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 22,
      height: 30,
      units: 'in',
    },
    weight: {
      value: 0.55,
      units: 'kg',
    },
    pricing: generatePricingArray(79.99),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 1000,
    },
  },
  'A-WH-JH001F': {
    sku: 'A-WH-JH001F',
    name: "Women's Premium Organic Cotton Hoodie",
    shortDescription:
      "Premium women's pullover hoodie with feminine fit. Made from sustainable organic cotton for comfort and style.",
    features: [
      'Feminine fit with side seams',
      'Classic pullover design with kangaroo pocket',
      'Lined hood with matching drawcords',
      'Ribbed cuffs and hem',
      'Soft brushed fleece interior',
      'Made with GOTS certified organic cotton',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '85% organic ring-spun combed cotton, 15% recycled polyester',
      '350 GSM fabric weight',
    ],
    ecoProperties: [
      'GOTS certified organic cotton',
      'PETA-approved vegan friendly',
      'Fair Wear Foundation member',
      'Sustainable textile production',
    ],
    careInstructions: [
      'Wash similar colours together',
      'Do not iron on print',
      'Wash and iron inside out',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Stanley%20Stella%20Stella%20Cruiser%20STSW148.pdf',
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    productType: 'HOODIE',
    category: "Women's Hoodies",
    imageUrls: {
      base: '/assets/images/Apparel/Womens/Hoodies/A-WH-JH001F/Blanks/png',
      productImage: '/assets/images/Apparel/Womens/Hoodies/A-WH-JH001F/ProductImage/image.png',
    },
    colorOptions: [
      { name: 'Black', filename: 'black.png' },
      { name: 'White', filename: 'white.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'Heather Grey', filename: 'heather-grey.png' },
    ],
    brand: {
      name: 'Stanley/Stella',
      identifier: 'SS',
    },
    identifiers: {
      mpn: 'STSW148',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in',
    },
    weight: {
      value: 0.5,
      units: 'kg',
    },
    pricing: generatePricingArray(75.99),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 1000,
    },
  },
  'HOOD-AWD-JH001B': {
    sku: 'HOOD-AWD-JH001B',
    name: 'Kids Premium Hoodie',
    shortDescription:
      'Premium kids hoodie with soft brushed fleece interior. Comfortable and durable for active kids.',
    features: [
      'Double fabric hood with matching drawcords',
      'Kangaroo pouch pocket',
      'Ribbed cuffs and hem',
      'Twin needle stitching',
      'Brushed inner fleece for warmth',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '80% ringspun cotton, 20% polyester',
      'Brushed back fleece',
      '280 GSM fabric weight',
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Kid-safe materials',
      'Sustainable manufacturing',
      'Oeko-Tex® Standard 100 Certified',
    ],
    careInstructions: [
      'Machine wash at 30°C',
      'Do not bleach',
      'Iron on low heat',
      'Do not iron decoration',
      'Do not dry clean',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20AWDis%20JH001J.pdf',
    size: ['3-4Y', '5-6Y', '7-8Y', '9-11Y', '12-13Y'],
    productType: 'KIDS_HOODIE',
    category: 'Kids Hoodies',
    imageUrls: {
      base: '/assets/images/Apparel/Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/Blanks/png',
      productImage: '/assets/images/Apparel/Kids+Babies/Kids/Hoodies/HOOD-AWD-JH001B/ProductImage/image.png',
    },
    colorOptions: [
      { name: 'Arctic White', filename: 'arctic-white.png' },
      { name: 'Jet Black', filename: 'jet-black.png' },
      { name: 'Charcoal', filename: 'charcoal.png' },
      { name: 'Heather Grey', filename: 'heather-grey.png' },
      { name: 'Oxford Navy', filename: 'oxford-navy.png' },
      { name: 'Royal Blue', filename: 'royal-blue.png' },
    ],
    brand: {
      name: 'AWDis',
      identifier: 'AWD',
    },
    identifiers: {
      mpn: 'JH001B',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 18,
      height: 26,
      units: 'in',
    },
    weight: {
      value: 0.4,
      units: 'kg',
    },
    pricing: generatePricingArray(75.99),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
};

// This file exports hoodie product details for use in other parts of the application
// The hoodieDetails object contains comprehensive product information including:
// - Product specifications and features
// - Pricing across multiple currencies and regions
// - Shipping zones and costs
// - Material and eco-properties
// - Care instructions
// - Image URLs and color options
