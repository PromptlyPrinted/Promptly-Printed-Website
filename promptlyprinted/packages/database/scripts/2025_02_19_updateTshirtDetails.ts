import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { ProductDetails, updateProductDetails } from './2025_02_19_updateProductDetails.js';

dotenv.config();

const prisma = new PrismaClient();

const tshirtDetails: Record<string, ProductDetails> = {
    // Men's T-shirts
  'TEE-SS-STTU755': {
    sku: 'TEE-SS-STTU755',
    name: 'Creator 2.0 T-Shirt',
    shortDescription: 'Premium organic cotton unisex t-shirt with modern fit',
    features: [
      'Medium fit',
      'Set-in sleeve',
      'Ribbed crew neck',
      'Inside back neck tape',
      'Sleeve hem and bottom hem with double topstitch',
      'GOTS certified organic cotton'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% organic cotton, 180 GSM'],
    ecoProperties: [
      'GOTS certified organic cotton',
      'PETA-approved vegan',
      'Fair Wear Foundation member',
      'Sustainable textile production'
    ],
    careInstructions: [
      'Wash similar colours together',
      'Do not iron on print',
      'Wash and iron inside out'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Stanley%20Stella%20Creator%202.0%20STTU755.pdf',
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Mens/TEE-SS-STTU755/TEE-SS-STTU755_front.jpg',
      back: '/assets/images/Apparel/Mens/TEE-SS-STTU755/TEE-SS-STTU755_back.jpg',
      closeup: '/assets/images/Apparel/Mens/TEE-SS-STTU755/TEE-SS-STTU755_closeup.jpg',
      lifestyle: '/assets/images/Apparel/Mens/TEE-SS-STTU755/TEE-SS-STTU755_lifestyle.jpg'
    },
    brand: {
      name: 'Stanley/Stella',
      identifier: 'SS'
    },
    identifiers: {
      mpn: 'STTU755'
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in'
    },
    weight: {
      value: 0.18,
      units: 'kg'
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
      front: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_front.png',
      back: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_back.png',
      closeup: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_closeup.png',
      lifestyle: '/assets/images/Apparel/Mens/GLOBAL-TEE-BC-3413/GLOBAL-TEE-BC-3413_lifestyle.png'
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
      front: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_front.png',
      back: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_back.png',
      closeup: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_closeup.png',
      lifestyle: '/assets/images/Apparel/Mens/TT-GIL-64200/TT-GIL-64200_lifestyle.png'
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
      front: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_front.png',
      back: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_back.png',
      closeup: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_closeup.png',
      lifestyle: '/assets/images/Apparel/Mens/GLOBAL-TEE-GIL-64V00/GLOBAL-TEE-GIL-64V00_lifestyle.png'
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
      front: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_front.png',
      back: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_back.png',
      closeup: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_closeup.png',
      lifestyle: '/assets/images/Apparel/Mens/A-ML-GD2400/A-ML-GD2400_lifestyle.png'
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
    }
  },
  // Women's T-shirts
  'A-WT-GD64000L': {
    sku: 'A-WT-GD64000L',
    name: 'Classic Women\'s T-Shirt',
    shortDescription: 'Soft and comfortable women\'s t-shirt with feminine fit',
    features: [
      'Semi-fitted silhouette',
      'Seamless collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hem'
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
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064000L.pdf',
    productType: 'T_SHIRT',
    category: "Women's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_front.png',
      back: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_back.png',
      closeup: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_closeup.png',
      lifestyle: '/assets/images/Apparel/Womens/A-WT-GD64000L/A-WT-GD64000L_lifestyle.png'
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
    }
  },
  'GLOBAL-TEE-BC-6035': {
    sku: 'GLOBAL-TEE-BC-6035',
    name: 'V-Neck Women\'s T-Shirt',
    shortDescription: 'Flattering v-neck t-shirt with modern feminine fit',
    features: [
      'Deep v-neck',
      'Side-seamed construction',
      'Slim fit',
      'Longer length'
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% combed and ring-spun cotton'],
    ecoProperties: ['Eco-friendly dye process'],
    careInstructions: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not iron decoration',
      'Do not dry clean'
    ],
    pdfUrl: 'https://www.prodigi.com/download/product-range/Prodigi%20Bella+Canvas%206035.pdf',
    productType: 'T_SHIRT',
    category: "Women's T-shirts",
    imageUrls: {
      front: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_front.png',
      back: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_back.png',
      closeup: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_closeup.png',
      lifestyle: '/assets/images/Apparel/Womens/GLOBAL-TEE-BC-6035/GLOBAL-TEE-BC-6035_lifestyle.png'
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
    }
  },
  'SWEAT-AWD-JH030B': {
    sku: 'SWEAT-AWD-JH030B',
    name: 'Kids Sweatshirt',
    shortDescription: 'Premium kids sweatshirt with modern fit and superior comfort',
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
    }
  }
};

async function main() {
  try {
    console.log('Starting T-shirt product details update...');
    
    for (const [sku, details] of Object.entries(tshirtDetails)) {
      await updateProductDetails(details);
    }

    console.log('Finished updating T-shirt product details');
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 