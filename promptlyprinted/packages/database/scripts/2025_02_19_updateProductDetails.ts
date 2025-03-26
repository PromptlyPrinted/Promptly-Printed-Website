import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

dotenv.config();

const prisma = new PrismaClient();

// Top 20 countries for dropshipping apparel with their currency codes
const SUPPORTED_COUNTRIES = [
  { code: 'US', currency: 'USD' },
  { code: 'GB', currency: 'GBP' },
  { code: 'DE', currency: 'EUR' },
  { code: 'AU', currency: 'AUD' },
  { code: 'FR', currency: 'EUR' },
  { code: 'CH', currency: 'CHF' },
  { code: 'SE', currency: 'SEK' },
  { code: 'AE', currency: 'AED' },
  { code: 'ES', currency: 'EUR' },
  { code: 'IT', currency: 'EUR' },
  { code: 'NL', currency: 'EUR' },
  { code: 'DK', currency: 'DKK' },
  { code: 'NO', currency: 'NOK' },
  { code: 'NZ', currency: 'NZD' },
  { code: 'IE', currency: 'EUR' },
  { code: 'KR', currency: 'KRW' },
  { code: 'JP', currency: 'JPY' },
  { code: 'BE', currency: 'EUR' },
  { code: 'SG', currency: 'SGD' },
  { code: 'CN', currency: 'CNY' },
];

interface ProductListInfo {
  sku: string;
  name: string;
  shortDescription: string;
  price: number;
  category: string;
  productType: string;
  imageUrls: {
    front?: string;
    back?: string;
    thumbnail?: string;
  };
  brand: {
    name: string;
    identifier?: string;
  };
  availability: string;
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
  productType: string;
  category: string;
  imageUrls: {
    base: string;
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

interface ColorOption {
  name: string;
  filename: string;
}

interface ImageUrls {
  base?: string;
  front?: string;
  back?: string;
  closeup?: string;
  lifestyle?: string;
  thumbnail?: string;
}

interface SourceUrls {
  [key: string]: ImageUrls;
}

const productDetailsMap: Record<string, ProductDetails> = {
  'GLOBAL-TEE-GIL-5000': {
    sku: 'GLOBAL-TEE-GIL-5000',
    name: 'Classic T-Shirt',
    shortDescription: 'Premium cotton blend t-shirt with classic fit',
    features: [
      'Seamless double-needle collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hem',
      'Quarter-turned to eliminate center crease'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% cotton (fiber content may vary for different colors)'],
    ecoProperties: ['WRAP certified manufacturing'],
    careInstructions: [
      'Machine wash warm, inside out',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%205000.pdf',
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-5000/Blanks/png',
      front: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-5000/front.jpg',
      back: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-5000/back.jpg',
      closeup: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-5000/closeup.jpg',
      lifestyle: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-5000/lifestyle.jpg'
    },
    brand: {
      name: 'Gildan',
      identifier: 'GIL'
    },
    identifiers: {
      gtin: '614141999996',
      mpn: '5000'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in'
    },
    weight: {
      value: 0.3,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'AU3-TEE-U-B-3200': {
    sku: 'AU3-TEE-U-B-3200',
    name: 'Baseball Top',
    shortDescription: 'Stylish baseball-style top with raglan sleeves',
    features: [
      'Raglan sleeves',
      'Crew neck',
      'Athletic fit',
      'Contrast sleeves'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['52% cotton, 48% polyester'],
    ecoProperties: ['Eco-friendly manufacturing process'],
    careInstructions: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Bella+Canvas%203200.pdf',
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/T-Shirts/AU3-TEE-U-B-3200/Blanks/png',
      front: '/assets/images/Apparel/Mens/T-Shirts/AU3-TEE-U-B-3200/front.jpg',
      back: '/assets/images/Apparel/Mens/T-Shirts/AU3-TEE-U-B-3200/back.jpg',
      closeup: '/assets/images/Apparel/Mens/T-Shirts/AU3-TEE-U-B-3200/closeup.jpg',
      front: '/assets/images/Apparel/Mens/AU3-TEE-U-B-3200/AU3-TEE-U-B-3200_front.jpg',
      back: '/assets/images/Apparel/Mens/AU3-TEE-U-B-3200/AU3-TEE-U-B-3200_back.jpg',
      closeup: '/assets/images/Apparel/Mens/AU3-TEE-U-B-3200/AU3-TEE-U-B-3200_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Mens/AU3-TEE-U-B-3200/AU3-TEE-U-B-3200_lifestyle.jpg'
    },
    brand: {
      name: 'Bella+Canvas',
      identifier: 'BC'
    },
    identifiers: {
      mpn: '3200'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in'
    },
    weight: {
      value: 0.25,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'GLOBAL-TEE-BC-3413': {
    sku: 'GLOBAL-TEE-BC-3413',
    name: 'Triblend T-Shirt',
    shortDescription: 'Ultra-soft triblend t-shirt for premium comfort',
    features: [
      'Sideseamed construction',
      'Retail fit',
      'Crew neck',
      'Superior drape'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['50% polyester, 25% cotton, 25% rayon'],
    ecoProperties: ['Eco-friendly dye process'],
    careInstructions: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Bella+Canvas%203413.pdf',
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_front.jpg',
      back: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_back.jpg',
      closeup: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_lifestyle.jpg'
    },
    brand: {
      name: 'Bella+Canvas',
      identifier: 'BC'
    },
    identifiers: {
      mpn: '3413'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in'
    },
    weight: {
      value: 0.25,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'TT-GIL-64200': {
    sku: 'TT-GIL-64200',
    name: 'Tank Top',
    shortDescription: 'Classic tank top for casual comfort',
    features: [
      'Double-needle stitched neckline and armholes',
      'Athletic cut',
      'Seamless collar',
      'Taped neck and shoulders'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% cotton (fiber content may vary for different colors)'],
    ecoProperties: ['WRAP certified manufacturing'],
    careInstructions: [
      'Machine wash warm',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064200.pdf',
    productType: 'TANK_TOP',
    category: "Men's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_front.jpg',
      back: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_back.jpg',
      closeup: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_lifestyle.jpg'
    },
    brand: {
      name: 'Gildan',
      identifier: 'GIL'
    },
    identifiers: {
      mpn: '64200'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in'
    },
    weight: {
      value: 0.2,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'GLOBAL-TEE-GIL-64V00': {
    sku: 'GLOBAL-TEE-GIL-64V00',
    name: 'V-Neck T-Shirt',
    shortDescription: 'Modern v-neck t-shirt with classic fit',
    features: [
      'Seamless collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hem',
      'Quarter-turned to eliminate center crease'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% cotton (fiber content may vary for different colors)'],
    ecoProperties: ['WRAP certified manufacturing'],
    careInstructions: [
      'Machine wash warm',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064V00.pdf',
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_front.jpg',
      back: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_back.jpg',
      closeup: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_lifestyle.jpg'
    },
    brand: {
      name: 'Gildan',
      identifier: 'GIL'
    },
    identifiers: {
      mpn: '64V00'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in'
    },
    weight: {
      value: 0.25,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'A-ML-GD2400': {
    sku: 'A-ML-GD2400',
    name: 'Long Sleeve T-Shirt',
    shortDescription: 'Classic long sleeve t-shirt for year-round wear',
    features: [
      'Seamless collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hem',
      'Rib cuffs'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% cotton (fiber content may vary for different colors)'],
    ecoProperties: ['WRAP certified manufacturing'],
    careInstructions: [
      'Machine wash warm',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%202400.pdf',
    productType: 'LONG_SLEEVE_T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_front.jpg',
      back: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_back.jpg',
      closeup: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_lifestyle.jpg'
    },
    brand: {
      name: 'Gildan',
      identifier: 'GIL'
    },
    identifiers: {
      mpn: '2400'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in'
    },
    weight: {
      value: 0.3,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  // Women's T-shirts
  'A-WT-GD64000L': {
    sku: 'A-WT-GD64000L',
    name: 'Classic Women\'s T-Shirt',
    shortDescription: 'Premium fitted ladies t-shirt with superior comfort and style',
    features: [
      'Semi-fitted contoured silhouette with side seams',
      'Cap sleeves for feminine fit',
      'Seamless double-needle 1/2" collar',
      'Taped neck and shoulders for durability',
      'Double-needle sleeve and bottom hems'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% preshrunk cotton (Sport Grey: 90% cotton, 10% polyester)'],
    ecoProperties: [
      'WRAP certified manufacturing',
      'Oeko-Tex® Standard 100 Certified',
      'Worldwide Responsible Accredited Production'
    ],
    careInstructions: [
      'Machine wash warm, inside out',
      'Use non-chlorine bleach when needed',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064000L.pdf',
    productType: 'T_SHIRT',
    category: "Women's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_front.jpg',
      back: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_back.jpg',
      closeup: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_lifestyle.jpg'
    },
    brand: {
      name: 'Gildan',
      identifier: 'GIL'
    },
    identifiers: {
      mpn: '64000L'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 18,
      height: 26,
      units: 'in'
    },
    weight: {
      value: 0.25,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'GLOBAL-TEE-BC-6035': {
    sku: 'GLOBAL-TEE-BC-6035',
    name: 'V-Neck Women\'s T-Shirt',
    shortDescription: 'Premium fitted v-neck t-shirt with modern silhouette',
    features: [
      'Deep V-neck collar',
      'Side-seamed construction for fitted look',
      'Longer body length',
      'Superior combed and ring-spun cotton',
      'Retail fit'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      'Solid Colors: 100% combed and ring-spun cotton',
      'Athletic Heather: 90% cotton, 10% polyester',
      'Other Heathers: 52% cotton, 48% polyester'
    ],
    ecoProperties: [
      'Eco-friendly dye process',
      'Sustainable manufacturing practices',
      'WRAP certified facilities'
    ],
    careInstructions: [
      'Machine wash cold',
      'Tumble dry low',
      'Remove promptly',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Bella+Canvas%206035.pdf',
    productType: 'T_SHIRT',
    category: "Women's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_front.jpg',
      back: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_back.jpg',
      closeup: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_lifestyle.jpg'
    },
    brand: {
      name: 'Bella+Canvas',
      identifier: 'BC'
    },
    identifiers: {
      mpn: '6035'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 18,
      height: 26,
      units: 'in'
    },
    weight: {
      value: 0.25,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  // Babies
  'A-BB-LA4411': {
    sku: 'A-BB-LA4411',
    name: 'Baby Bodysuit',
    shortDescription: 'Premium infant bodysuit with lap shoulders and snap closure',
    features: [
      'Lap shoulders for easy dressing',
      'Three-snap closure at bottom',
      'Double-needle ribbed binding on neck, shoulders, sleeves and leg openings',
      'Reinforced three-snap closure',
      'EasyTear™ label'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '100% combed ring-spun cotton',
      '5.8-ounce jersey knit',
      'White is sewn with 100% cotton thread'
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Baby-safe materials',
      'Sustainable manufacturing'
    ],
    careInstructions: [
      'Machine wash cold with like colors',
      'Only non-chlorine bleach when needed',
      'Tumble dry low',
      'Cool iron if necessary',
      'Do not iron decoration'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20LAT%20Apparel%204411.pdf',
    productType: 'BABY_BODYSUIT',
    category: "Baby Clothing",
    imageUrls: {
      front: '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/A-BB-LA4411_front.jpg',
      back: '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/A-BB-LA4411_back.jpg',
      closeup: '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/A-BB-LA4411_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/A-BB-LA4411_lifestyle.jpg'
    },
    brand: {
      name: 'LAT Apparel',
      identifier: 'LA'
    },
    identifiers: {
      mpn: '4411'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 12,
      height: 18,
      units: 'in'
    },
    weight: {
      value: 0.15,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'GLOBAL-TEE-RS-3322': {
    sku: 'GLOBAL-TEE-RS-3322',
    name: 'Baby T-Shirt',
    shortDescription: 'Soft and durable baby t-shirt with easy-on neckline',
    features: [
      'Shoulder-to-shoulder tape for strength',
      'Double-needle hemmed sleeves and bottom',
      'Easy-on neckline',
      'Flatlock seams for comfort',
      'EasyTear™ label'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '100% combed ring-spun cotton',
      '5.8-ounce jersey knit',
      'White is sewn with 100% cotton thread'
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Baby-safe dyes',
      'Sustainable manufacturing'
    ],
    careInstructions: [
      'Machine wash cold with like colors',
      'Only non-chlorine bleach when needed',
      'Tumble dry low',
      'Cool iron if necessary',
      'Do not iron decoration'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20LAT%20Apparel%203322.pdf',
    productType: 'BABY_T_SHIRT',
    category: "Baby Clothing",
    imageUrls: {
      front: '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/GLOBAL-TEE-RS-3322_front.jpg',
      back: '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/GLOBAL-TEE-RS-3322_back.jpg',
      closeup: '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/GLOBAL-TEE-RS-3322_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/GLOBAL-TEE-RS-3322_lifestyle.jpg'
    },
    brand: {
      name: 'LAT Apparel',
      identifier: 'LA'
    },
    identifiers: {
      mpn: '3322'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 12,
      height: 18,
      units: 'in'
    },
    weight: {
      value: 0.15,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  // Kids
  'A-KT-GD64000B': {
    sku: 'A-KT-GD64000B',
    name: 'Kids T-Shirt',
    shortDescription: 'Classic youth t-shirt with durable construction',
    features: [
      'Seamless double-needle 7/8" collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hems',
      'Quarter-turned to eliminate center crease',
      'Youth sizing for perfect fit'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '100% preshrunk cotton',
      'Sport Grey: 90% cotton, 10% polyester',
      'Safety colors: 50% cotton, 50% polyester'
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Kid-safe materials',
      'WRAP certified manufacturing'
    ],
    careInstructions: [
      'Machine wash warm, inside out',
      'Use non-chlorine bleach when needed',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064000B.pdf',
    productType: 'KIDS_T_SHIRT',
    category: "Kids' T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Kids+Babies/Kids/A-KT-GD64000B/A-KT-GD64000B_front.jpg',
      back: '/assets/images/Apparel/Kids+Babies/Kids/A-KT-GD64000B/A-KT-GD64000B_back.jpg',
      closeup: '/assets/images/Apparel/Kids+Babies/Kids/A-KT-GD64000B/A-KT-GD64000B_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Kids+Babies/Kids/A-KT-GD64000B/A-KT-GD64000B_lifestyle.jpg'
    },
    brand: {
      name: 'Gildan',
      identifier: 'GIL'
    },
    identifiers: {
      mpn: '64000B'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 16,
      height: 24,
      units: 'in'
    },
    weight: {
      value: 0.2,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  },
  'SWEAT-AWD-JH030B': {
    sku: 'SWEAT-AWD-JH030B',
    name: 'Kids Sweatshirt',
    shortDescription: 'Premium kids hoodie with modern fit and superior comfort',
    features: [
      'Double fabric hood with self-colored cords',
      'Kangaroo pouch pocket',
      'Ribbed cuffs and hem',
      'Twin needle stitching detailing',
      'Brushed inner fleece'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '80% ringspun cotton, 20% polyester',
      'Brushed back fleece',
      '280 GSM fabric weight'
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Kid-safe materials',
      'Sustainable manufacturing',
      'Oeko-Tex® Standard 100 Certified'
    ],
    careInstructions: [
      'Machine wash at 30°C',
      'Do not bleach',
      'Iron on low heat',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20AWDis%20JH030J.pdf',
    productType: 'KIDS_SWEATSHIRT',
    category: "Kids' Sweatshirts",
    imageUrls: {
      front: '/assets/images/Apparel/Kids+Babies/Kids/SWEAT-AWD-JH030B/SWEAT-AWD-JH030B_front.jpg',
      back: '/assets/images/Apparel/Kids+Babies/Kids/SWEAT-AWD-JH030B/SWEAT-AWD-JH030B_back.jpg',
      closeup: '/assets/images/Apparel/Kids+Babies/Kids/SWEAT-AWD-JH030B/SWEAT-AWD-JH030B_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Kids+Babies/Kids/SWEAT-AWD-JH030B/SWEAT-AWD-JH030B_lifestyle.jpg'
    },
    brand: {
      name: 'AWDis',
      identifier: 'AWD'
    },
    identifiers: {
      mpn: 'JH030B'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 16,
      height: 24,
      units: 'in'
    },
    weight: {
      value: 0.4,
      units: 'kg'
    },
    pricing: [],
    shippingZones: {},
    vatIncluded: true,
    customsDutyInfo: {},
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 0
    }
  }
};

const sourceUrls: SourceUrls = {
  'GLOBAL-TEE-GIL-5000': {
    front: 'https://dp.gildan.com/assets/5000/front_flat.png',
    back: 'https://dp.gildan.com/assets/5000/back_flat.png',
    closeup: 'https://dp.gildan.com/assets/5000/closeup.png',
    lifestyle: 'https://dp.gildan.com/assets/5000/lifestyle.png'
  },
  'AU3-TEE-U-B-3200': {
    front: 'https://assets.bellacanvas.com/3200/front_flat.png',
    back: 'https://assets.bellacanvas.com/3200/back_flat.png',
    closeup: 'https://assets.bellacanvas.com/3200/closeup.png',
    lifestyle: 'https://assets.bellacanvas.com/3200/lifestyle.png'
  },
  'GLOBAL-TEE-BC-3413': {
    front: 'https://assets.bellacanvas.com/3413/front_flat.png',
    back: 'https://assets.bellacanvas.com/3413/back_flat.png',
    closeup: 'https://assets.bellacanvas.com/3413/closeup.png',
    lifestyle: 'https://assets.bellacanvas.com/3413/lifestyle.png'
  },
  'TT-GIL-64200': {
    front: 'https://dp.gildan.com/assets/64200/front_flat.png',
    back: 'https://dp.gildan.com/assets/64200/back_flat.png',
    closeup: 'https://dp.gildan.com/assets/64200/closeup.png',
    lifestyle: 'https://dp.gildan.com/assets/64200/lifestyle.png'
  },
  'GLOBAL-TEE-GIL-64V00': {
    front: 'https://dp.gildan.com/assets/64V00/front_flat.png',
    back: 'https://dp.gildan.com/assets/64V00/back_flat.png',
    closeup: 'https://dp.gildan.com/assets/64V00/closeup.png',
    lifestyle: 'https://dp.gildan.com/assets/64V00/lifestyle.png'
  },
  'A-ML-GD2400': {
    front: 'https://dp.gildan.com/assets/2400/front_flat.png',
    back: 'https://dp.gildan.com/assets/2400/back_flat.png',
    closeup: 'https://dp.gildan.com/assets/2400/closeup.png',
    lifestyle: 'https://dp.gildan.com/assets/2400/lifestyle.png'
  },
  'A-WT-GD64000L': {
    front: 'https://dp.gildan.com/assets/64000L/front_flat.png',
    back: 'https://dp.gildan.com/assets/64000L/back_flat.png',
    closeup: 'https://dp.gildan.com/assets/64000L/closeup.png',
    lifestyle: 'https://dp.gildan.com/assets/64000L/lifestyle.png'
  },
  'GLOBAL-TEE-BC-6035': {
    front: 'https://assets.bellacanvas.com/6035/front_flat.png',
    back: 'https://assets.bellacanvas.com/6035/back_flat.png',
    closeup: 'https://assets.bellacanvas.com/6035/closeup.png',
    lifestyle: 'https://assets.bellacanvas.com/6035/lifestyle.png'
  },
  'A-BB-LA4411': {
    front: 'https://assets.latapparel.com/4411/front_flat.png',
    back: 'https://assets.latapparel.com/4411/back_flat.png',
    closeup: 'https://assets.latapparel.com/4411/closeup.png',
    lifestyle: 'https://assets.latapparel.com/4411/lifestyle.png'
  },
  'GLOBAL-TEE-RS-3322': {
    front: 'https://assets.latapparel.com/3322/front_flat.png',
    back: 'https://assets.latapparel.com/3322/back_flat.png',
    closeup: 'https://assets.latapparel.com/3322/closeup.png',
    lifestyle: 'https://assets.latapparel.com/3322/lifestyle.png'
  },
  'A-KT-GD64000B': {
    front: 'https://dp.gildan.com/assets/64000B/front_flat.png',
    back: 'https://dp.gildan.com/assets/64000B/back_flat.png',
    closeup: 'https://dp.gildan.com/assets/64000B/closeup.png',
    lifestyle: 'https://dp.gildan.com/assets/64000B/lifestyle.png'
  },
  'SWEAT-AWD-JH030B': {
    front: 'https://assets.awdis.com/JH030B/front_flat.png',
    back: 'https://assets.awdis.com/JH030B/back_flat.png',
    closeup: 'https://assets.awdis.com/JH030B/closeup.png',
    lifestyle: 'https://assets.awdis.com/JH030B/lifestyle.png'
  }
} as const;

type ProductSku = keyof typeof basePrices;

// Base prices in USD
const basePrices = {
  'TEE-SS-STTU755': 71.99,
  'GLOBAL-TEE-BC-3413': 71.99,
  'TT-GIL-64200': 68.99,
  'GLOBAL-TEE-GIL-64V00': 69.99,
  'A-ML-GD2400': 71.99,
  'A-WT-GD64000L': 65.99,
  'GLOBAL-TEE-BC-6035': 65.99,
  'A-KT-GD64000B': 65.99,
  'SWEAT-AWD-JH030B': 67.99,
  'A-BB-LA4411': 65.99,
  'GLOBAL-TEE-RS-3322': 65.99
} as const;

async function downloadPDF(url: string, sku: string): Promise<void> {
  const downloadDir = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }

  const fileName = path.join(downloadDir, `${sku}.pdf`);
  const file = fs.createWriteStream(fileName);

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(fileName, () => reject(err));
    });
  });
}

async function downloadImage(url: string, sku: string, view: string): Promise<string> {
  const assetDir = path.join(__dirname, 'assets', 'images');
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  const fileName = path.join(assetDir, `${sku}_${view}.png`);
  const file = fs.createWriteStream(fileName);

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(`/assets/images/${sku}_${view}.png`);
      });
    }).on('error', (err) => {
      fs.unlink(fileName, () => reject(err));
    });
  });
}

async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json() as { rates: Record<string, number> };
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
}

function convertPrice(priceUSD: number, exchangeRate: number): number {
  return Math.round(priceUSD * exchangeRate * 100) / 100;
}

function getProductListInfo(details: ProductDetails, basePrice: number): ProductListInfo {
  return {
    sku: details.sku,
    name: details.name,
    shortDescription: details.shortDescription,
    price: basePrice,
    category: details.category,
    productType: details.productType,
    imageUrls: {
      front: details.imageUrls.front,
      back: details.imageUrls.back,
      thumbnail: details.imageUrls.closeup || details.imageUrls.front
    },
    brand: details.brand,
    availability: details.availability
  };
}

async function updateProductDetails(details: ProductDetails) {
  try {
    // Get exchange rates
    const exchangeRates = await getExchangeRates();
    const basePrice = basePrices[details.sku as ProductSku] || 69.99; // Default price if not found

    // First download the PDF and images
    console.log(`Downloading assets for ${details.sku}...`);
    await downloadPDF(details.pdfUrl, details.sku);

    // Download images from source URLs
    const urls = sourceUrls[details.sku];
    if (urls) {
      const downloadPromises = [];
      if (urls.front) {
        downloadPromises.push(downloadImage(urls.front, details.sku, 'front'));
      }
      if (urls.back) {
        downloadPromises.push(downloadImage(urls.back, details.sku, 'back'));
      }
      if (urls.closeup) {
        downloadPromises.push(downloadImage(urls.closeup, details.sku, 'closeup'));
      }
      if (urls.lifestyle) {
        downloadPromises.push(downloadImage(urls.lifestyle, details.sku, 'lifestyle'));
      }
      await Promise.all(downloadPromises);
    }

    // Get product list info for quick access
    const listInfo = getProductListInfo(details, basePrice);

    // For each supported country
    for (const country of SUPPORTED_COUNTRIES) {
      const { code: countryCode, currency } = country;

      // Calculate prices in local currency
      const exchangeRate = exchangeRates[currency] || 1;
      const localPrice = convertPrice(basePrice, exchangeRate);
      const taxRate = 0.2; // 20% tax rate
      const taxAmount = localPrice * taxRate;
      const totalCost = localPrice + taxAmount;

      // Update the product in the database
      console.log(`Updating product details for ${details.sku} in ${countryCode}...`);
      
      // First find or create the category
      const category = await prisma.category.upsert({
        where: { name: details.category },
        create: { name: details.category },
        update: {}
      });

      // Then update the product
      await prisma.product.upsert({
        where: {
          sku_countryCode: {
            sku: details.sku,
            countryCode
          }
        },
        create: {
          // Basic product list information
          sku: listInfo.sku,
          name: listInfo.name,
          description: `${details.shortDescription}\n\nFeatures:\n${details.features.join('\n')}\n\nMaterials:\n${details.materials.join('\n')}\n\nCare Instructions:\n${details.careInstructions.join('\n')}\n\nEco Properties:\n${details.ecoProperties.join('\n')}`,
          productType: listInfo.productType,
          images: {
            create: Object.entries(listInfo.imageUrls)
              .filter(([_, url]) => url !== undefined)
              .map(([type, url]) => ({
                url: url as string,
                alt: `${listInfo.name} - ${type.charAt(0).toUpperCase() + type.slice(1)} View`
              }))
          },
          brand: listInfo.brand.name,

          // Pricing information
          price: localPrice,
          currency,
          countryCode,
          categoryId: category.id,
          shippingCost: 0,
          taxAmount,
          totalCost,
          customerPrice: totalCost,

          // Product attributes
          listed: true,
          width: details.dimensions.width,
          height: details.dimensions.height,
          units: details.dimensions.units,
          edge: 'standard',
          color: ['white'],
          gender: details.category.includes("Women's") ? 'F' : details.category.includes("Men's") ? 'M' : 'U',
          size: ['S', 'M', 'L', 'XL', '2XL'],
          style: details.productType.toLowerCase(),

          // Additional product information
          prodigiAttributes: JSON.stringify({
            brand: details.brand,
            dimensions: details.dimensions,
            availability: details.availability,
            identifiers: details.identifiers,
            weight: details.weight,
            imageUrls: details.imageUrls,
            features: details.features,
            materials: details.materials,
            careInstructions: details.careInstructions,
            ecoProperties: details.ecoProperties,
            manufacturingLocation: details.manufacturingLocation
          }),

          // New international fields
          pricing: details.pricing,
          shippingZones: details.shippingZones,
          vatIncluded: details.vatIncluded,
          customsDutyInfo: details.customsDutyInfo,
          restrictions: details.restrictions
        },
        update: {
          // Update only necessary fields
          name: details.name,
          description: `${details.shortDescription}\n\nFeatures:\n${details.features.join('\n')}\n\nMaterials:\n${details.materials.join('\n')}\n\nCare Instructions:\n${details.careInstructions.join('\n')}\n\nEco Properties:\n${details.ecoProperties.join('\n')}`,
          price: localPrice,
          currency,
          shippingCost: 0,
          taxAmount,
          totalCost,
          customerPrice: totalCost,
          updatedAt: new Date(),
          pricing: details.pricing,
          shippingZones: details.shippingZones,
          vatIncluded: details.vatIncluded,
          customsDutyInfo: details.customsDutyInfo,
          restrictions: details.restrictions
        }
      });

      console.log(`Successfully updated ${details.sku} for ${countryCode}`);
    }
  } catch (error) {
    console.error(`Error updating ${details.sku}:`, error);
  }
}

async function main() {
  try {
    console.log('Starting product details update...');
    
    for (const [sku, details] of Object.entries(productDetailsMap)) {
      await updateProductDetails(details);
    }

    console.log('Finished updating product details');
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

export type { ProductDetails };
export { updateProductDetails }; 