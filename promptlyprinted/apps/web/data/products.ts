// Define exchange rates first
const exchangeRates = {
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
} as const;

// Helper function to convert USD to other currencies
function convertFromUSD(
  amount: number,
  targetCurrency: keyof typeof exchangeRates
): number {
  const rate = exchangeRates[targetCurrency];
  if (!rate) throw new Error(`Unsupported currency: ${targetCurrency}`);
  return Math.round(amount * rate);
}

// Helper function to generate pricing array from USD base price
function generatePricingArray(
  basePrice: number
): Array<{ amount: number; currency: string }> {
  return [
    { amount: basePrice, currency: 'USD' },
    { amount: convertFromUSD(basePrice, 'EUR'), currency: 'EUR' },
    { amount: convertFromUSD(basePrice, 'GBP'), currency: 'GBP' },
    { amount: convertFromUSD(basePrice, 'AUD'), currency: 'AUD' },
    { amount: convertFromUSD(basePrice, 'CHF'), currency: 'CHF' },
    { amount: convertFromUSD(basePrice, 'SEK'), currency: 'SEK' },
    { amount: convertFromUSD(basePrice, 'AED'), currency: 'AED' },
    { amount: convertFromUSD(basePrice, 'DKK'), currency: 'DKK' },
    { amount: convertFromUSD(basePrice, 'NOK'), currency: 'NOK' },
    { amount: convertFromUSD(basePrice, 'NZD'), currency: 'NZD' },
    { amount: convertFromUSD(basePrice, 'KRW'), currency: 'KRW' },
    { amount: convertFromUSD(basePrice, 'JPY'), currency: 'JPY' },
    { amount: convertFromUSD(basePrice, 'SGD'), currency: 'SGD' },
    { amount: convertFromUSD(basePrice, 'CNY'), currency: 'CNY' },
  ];
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
      estimatedDays: '2-5', // For AU domestic
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
      estimatedDays: '10-15', // For UK/EU to Rest of world
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
  UK: 'UK VAT (20%) will be factored into the price',
  US: 'No additional import duties for orders under $800',
  APAC: 'Import duties may apply, calculated at checkout',
  ROW: 'Import duties may apply, calculated at checkout',
};

// Export the tshirt details for use in other files
export const tshirtDetails = {
  // Men's T-shirts
  'TEE-SS-STTU755': {
    sku: 'TEE-SS-STTU755',
    name: "Men's Classic T-Shirt",
    shortDescription:
      'Premium 100% organic cotton unisex t-shirt with modern fit. Sustainably made, breathable comfort for everyday casual wear. GOTS certified eco-friendly apparel.',
    features: [
      'Modern medium fit for versatile styling',
      'Premium set-in sleeve design for enhanced comfort',
      'Durable ribbed crew neck that keeps its shape',
      'Reinforced inside back neck tape for lasting quality',
      'Double-topstitched sleeve and bottom hem for durability',
      'Made with 100% GOTS certified organic cotton for sustainability',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      'Premium 100% organic cotton, 180 GSM weight for perfect drape',
    ],
    ecoProperties: [
      'GOTS certified organic cotton for sustainable fashion',
      'PETA-approved vegan friendly materials',
      'Fair Wear Foundation member ensuring ethical production',
      'Sustainable textile production with eco-friendly practices',
    ],
    careInstructions: [
      'Wash similar colours together',
      'Do not iron on print',
      'Wash and iron inside out',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Stanley%20Stella%20Creator%202.0%20STTU755.pdf',
    size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/T-Shirts/TEE-SS-STTU755/Blanks/png',
      productImage: '/assets/images/Apparel/Mens/T-Shirts/TEE-SS-STTU755/ProductImage/image.png',
      cover: '/assets/images/Apparel/Mens/T-Shirts/TEE-SS-STTU755/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Mens/T-Shirts/TEE-SS-STTU755/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'White', filename: 'white.png' },
      { name: 'Vintage White', filename: 'vintage-white.png' },
      { name: 'Off White', filename: 'off-white.png' },
      { name: 'Black', filename: 'black.png' },
      { name: 'Anthracite', filename: 'Anthracite.png' },
      { name: 'Dark Heather Grey', filename: 'dark-heather-grey.png' },
      { name: 'India Ink Grey', filename: 'india-ink-grey.png' },
      { name: 'French Navy', filename: 'french-navy.png' },
      { name: 'Bright Blue', filename: 'bright-blue.png' },
      { name: 'Stargazer', filename: 'stargazer.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Burgundy', filename: 'burgundy.png' },
      { name: 'Cotton Pink', filename: 'cotton-pink.png' },
      { name: 'Glazed Green', filename: 'glazed-green.png' },
      { name: 'Khaki', filename: 'khaki.png' },
      { name: 'Desert Dust', filename: 'desert-dust.png' },
      { name: 'Ochre', filename: 'ochre.png' },
      { name: 'Spectra Yellow', filename: 'spectra-yellow.png' },
    ],
    brand: {
      name: 'Stanley/Stella',
      identifier: 'SS',
    },
    identifiers: {
      mpn: 'STTU755',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in',
    },
    weight: {
      value: 0.18,
      units: 'kg',
    },
    pricing: generatePricingArray(72),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },

  'GLOBAL-TEE-BC-3413': {
    sku: 'GLOBAL-TEE-BC-3413',
    name: "Men's Triblend T-Shirt",
    shortDescription: 'Ultra-soft triblend t-shirt for premium comfort',
    features: [
      'Ultra-soft 3.8 oz triblend fabric',
      '50% polyester, 25% combed and ring-spun cotton, 25% rayon',
      'Modern fit with side seams',
      'Double-needle stitching throughout',
      'Comfortable lightweight fabric',
    ],
    manufacturingLocation: 'United States',
    materials: ['50% Polyester, 25% Combed and Ring-Spun Cotton, 25% Rayon'],
    ecoProperties: [
      'Sustainable fabric blend',
      'Low environmental impact',
      'Water-efficient production',
    ],
    careInstructions: ['Machine wash cold', 'Do not bleach', 'Tumble dry low'],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Triblend%20T-Shirt%20BC-3413.pdf',
    size: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-BC-3413/Blanks/png',
      productImage: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-BC-3413/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-BC-3413/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-BC-3413/Blanks/size-chart.png',
    },
    colorOptions: [
      {
        name: 'Military Green Triblend',
        filename: 'military-green-triblend.png',
      },
      {
        name: 'Vintage Royal Triblend',
        filename: 'vintage-royal-triblend.png',
      },
    ],
    brand: {
      name: 'Global',
      identifier: 'G',
    },
    identifiers: {
      mpn: 'BC-3413',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in',
    },
    weight: {
      value: 0.14,
      units: 'kg',
    },
    pricing: generatePricingArray(70),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 1000,
    },
  },

  'TT-GIL-64200': {
    sku: 'TT-GIL-64200',
    name: "Men's Tank Top",
    shortDescription: 'Classic tank top for casual comfort',
    features: [
      'Double-needle stitched neckline and armholes',
      'Athletic cut',
      'Seamless collar',
      'Taped neck and shoulders',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% cotton (fiber content may vary for different colors)'],
    ecoProperties: ['WRAP certified manufacturing'],
    careInstructions: [
      'Machine wash warm',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064200.pdf',
    size: ['S', 'M', 'L', 'XL', '2XL'],
    productType: 'TANK_TOP',
    category: "Men's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/T-Shirts/TT-GIL-64200/Blanks/png',
      productImage: '/assets/images/Apparel/Mens/T-Shirts/TT-GIL-64200/ProductImage/image.png',
      cover: '/assets/images/Apparel/Mens/T-Shirts/TT-GIL-64200/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Mens/T-Shirts/TT-GIL-64200/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Black', filename: 'black.png' },
      { name: 'Heather Grey', filename: 'heather-grey.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Charcoal', filename: 'charcoal.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'Sport Grey', filename: 'sport-grey.png' },
    ],
    brand: {
      name: 'Gildan',
      identifier: 'GIL',
    },
    identifiers: {
      mpn: '64200',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in',
    },
    weight: {
      value: 0.2,
      units: 'kg',
    },
    pricing: generatePricingArray(69),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
  'GLOBAL-TEE-GIL-64V00': {
    sku: 'GLOBAL-TEE-GIL-64V00',
    name: "Men's V-Neck T-Shirt",
    shortDescription: 'Modern v-neck t-shirt with classic fit',
    features: [
      'Seamless collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hem',
      'Quarter-turned to eliminate center crease',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% cotton (fiber content may vary for different colors)'],
    ecoProperties: ['WRAP certified manufacturing'],
    careInstructions: [
      'Machine wash warm',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064V00.pdf',
    size: ['S', 'M', 'L', 'XL', '2XL'],
    productType: 'T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/Blanks/png',
      productImage: '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Black', filename: 'black.png' },
      { name: 'Irish Green', filename: 'irish-green.png' },
      { name: 'Sport Grey', filename: 'sport-grey.png' },
      { name: 'Charcoal', filename: 'charcoal.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'White', filename: 'white.png' },
      { name: 'Dark Heather', filename: 'dark-heather.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Heather Purple', filename: 'heather-purple.png' },
      { name: 'Royal', filename: 'royal.png' },
    ],
    brand: {
      name: 'Gildan',
      identifier: 'GIL',
    },
    identifiers: {
      mpn: '64V00',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in',
    },
    weight: {
      value: 0.25,
      units: 'kg',
    },
    pricing: generatePricingArray(70),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
  'A-ML-GD2400': {
    sku: 'A-ML-GD2400',
    name: "Men's Long Sleeve T-Shirt",
    shortDescription: 'Classic long sleeve t-shirt for year-round wear',
    features: [
      'Seamless collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hem',
      'Rib cuffs',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% cotton (fiber content may vary for different colors)'],
    ecoProperties: ['WRAP certified manufacturing'],
    careInstructions: [
      'Machine wash warm',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%202400.pdf',
    size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
    productType: 'LONG_SLEEVE_T_SHIRT',
    category: "Men's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Mens/T-Shirts/A-ML-GD2400/Blanks/png',
      productImage: '/assets/images/Apparel/Mens/T-Shirts/A-ML-GD2400/ProductImage/image.png',
      cover: '/assets/images/Apparel/Mens/T-Shirts/A-ML-GD2400/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Mens/T-Shirts/A-ML-GD2400/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Black', filename: 'black.png' },
      { name: 'Light Blue', filename: 'light-blue.png' },
      { name: 'Royal', filename: 'royal.png' },
      { name: 'White', filename: 'white.png' },
      { name: 'Irish Green', filename: 'irish-green.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Sport Grey', filename: 'sport-grey.png' },
    ],
    brand: {
      name: 'Gildan',
      identifier: 'GIL',
    },
    identifiers: {
      mpn: '2400',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in',
    },
    weight: {
      value: 0.3,
      units: 'kg',
    },
    pricing: generatePricingArray(72),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },

  // Women's T-shirts
  'A-WT-GD64000L': {
    sku: 'A-WT-GD64000L',
    name: "Women's Classic T-Shirt",
    shortDescription:
      "Ultra-soft 100% cotton women's t-shirt with flattering semi-fitted silhouette. Perfect blend of comfort and style for everyday wear. Available in multiple fashion-forward colors.",
    features: [
      '100% cotton for ultimate comfort',
      'Semi-fitted silhouette',
      'Double-stitched neckline and sleeves',
      'Shoulder-to-shoulder taping',
      'Side-seamed construction',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% Cotton'],
    ecoProperties: [
      'Sustainable cotton',
      'Low water usage',
      'Environmentally friendly',
    ],
    careInstructions: ['Machine wash cold', 'Do not bleach', 'Tumble dry low'],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Women%27s%20Classic%20Soft%20Cotton%20T-Shirt%20GD64000L.pdf',
    size: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    productType: 'T_SHIRT',
    category: "Women's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Womens/T-Shirts/A-WT-GD64000L/Blanks/png',
      productImage: '/assets/images/Apparel/Womens/T-Shirts/A-WT-GD64000L/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Womens/T-Shirts/A-WT-GD64000L/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Womens/T-Shirts/A-WT-GD64000L/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Azalea', filename: 'azalea.png' },
      { name: 'Black', filename: 'black.png' },
      { name: 'Cornsilk', filename: 'cornsilk.png' },
      { name: 'Daisy', filename: 'daisy.png' },
      { name: 'Irish Green', filename: 'irish-green.png' },
      { name: 'Light Blue', filename: 'light-blue.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'Purple', filename: 'purple.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Royal', filename: 'royal.png' },
      { name: 'Sports Grey', filename: 'sports-grey.png' },
      { name: 'White', filename: 'white.png' },
    ],
    brand: {
      name: 'American Apparel',
      identifier: 'AA',
    },
    identifiers: {
      mpn: 'GD64000L',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 20,
      height: 28,
      units: 'in',
    },
    weight: {
      value: 0.14,
      units: 'kg',
    },
    pricing: generatePricingArray(67),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 1000,
    },
  },
  'GLOBAL-TEE-BC-6035': {
    sku: 'GLOBAL-TEE-BC-6035',
    name: "Women's V-Neck T-Shirt",
    shortDescription: 'Flattering v-neck t-shirt with modern feminine fit',
    features: [
      'Deep v-neck',
      'Side-seamed construction',
      'Slim fit',
      'Longer length',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: ['100% combed and ring-spun cotton'],
    ecoProperties: ['Eco-friendly dye process'],
    careInstructions: [
      'Machine wash cold',
      'Tumble dry low',
      'Do not iron decoration',
      'Do not dry clean',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Bella+Canvas%206035.pdf',
    size: ['S', 'M', 'L', 'XL', '2XL'],
    productType: 'T_SHIRT',
    category: "Women's T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Womens/T-Shirts/GLOBAL-TEE-BC-6035/Blanks/png',
      productImage: '/assets/images/Apparel/Womens/T-Shirts/GLOBAL-TEE-BC-6035/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Womens/T-Shirts/GLOBAL-TEE-BC-6035/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Womens/T-Shirts/GLOBAL-TEE-BC-6035/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Athletic Heather', filename: 'athletic-heather.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'White', filename: 'white.png' },
      { name: 'Black', filename: 'black.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Dark Grey', filename: 'dark-grey.png' },
      { name: 'True Royal', filename: 'true-royal.png' },
    ],
    brand: {
      name: 'Bella+Canvas',
      identifier: 'BC',
    },
    identifiers: {
      mpn: '6035',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 18,
      height: 26,
      units: 'in',
    },
    weight: {
      value: 0.25,
      units: 'kg',
    },
    pricing: generatePricingArray(66),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
  // Babies
  'A-BB-LA4411': {
    sku: 'A-BB-LA4411',
    name: "Baby's Bodysuit",
    shortDescription:
      'Premium infant bodysuit with lap shoulders and snap closure',
    features: [
      'Lap shoulders for easy dressing',
      'Three-snap closure at bottom',
      'Double-needle ribbed binding on neck, shoulders, sleeves and leg openings',
      'Reinforced three-snap closure',
      'EasyTear™ label',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '100% combed ring-spun cotton',
      '5.8-ounce jersey knit',
      'White is sewn with 100% cotton thread',
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Baby-safe materials',
      'Sustainable manufacturing',
    ],
    careInstructions: [
      'Machine wash cold with like colors',
      'Only non-chlorine bleach when needed',
      'Tumble dry low',
      'Cool iron if necessary',
      'Do not iron decoration',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20LAT%20Apparel%204411.pdf',
    size: ['Newborn', '6M', '12M', '18M'],
    productType: 'BABY_BODYSUIT',
    category: 'Baby Clothing',
    imageUrls: {
      base: '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/Blanks/png',
      productImage: '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Kids+Babies/Babies/A-BB-LA4411/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Black', filename: 'black.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Heather', filename: 'heather.png' },
      { name: 'Pink', filename: 'pink.png' },
      { name: 'White', filename: 'white.png' },
    ],
    brand: {
      name: 'LAT Apparel',
      identifier: 'LA',
    },
    identifiers: {
      mpn: '4411',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 12,
      height: 18,
      units: 'in',
    },
    weight: {
      value: 0.15,
      units: 'kg',
    },
    pricing: generatePricingArray(66),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
  'GLOBAL-TEE-RS-3322': {
    sku: 'GLOBAL-TEE-RS-3322',
    name: "Baby's T-Shirt",
    shortDescription: 'Soft and durable baby t-shirt with easy-on neckline',
    features: [
      'Shoulder-to-shoulder tape for strength',
      'Double-needle hemmed sleeves and bottom',
      'Easy-on neckline',
      'Flatlock seams for comfort',
      'EasyTear™ label',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '100% combed ring-spun cotton',
      '5.8-ounce jersey knit',
      'White is sewn with 100% cotton thread',
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Baby-safe dyes',
      'Sustainable manufacturing',
    ],
    careInstructions: [
      'Machine wash cold with like colors',
      'Only non-chlorine bleach when needed',
      'Tumble dry low',
      'Cool iron if necessary',
      'Do not iron decoration',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20LAT%20Apparel%203322.pdf',
    size: ['3-6M (UK/EU only)', '6-12M', '12-18M', '12-18M', '18-24M'],
    productType: 'BABY_T_SHIRT',
    category: 'Baby Clothing',
    imageUrls: {
      base: '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/Blanks/png',
      productImage: '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Kids+Babies/Babies/GLOBAL-TEE-RS-3322/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Apple', filename: 'apple.png' },
      { name: 'Butter', filename: 'butter.png' },
      { name: 'Heather', filename: 'heather.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Black', filename: 'black.png' },
      { name: 'Charcoal', filename: 'charcoal.png' },
      { name: 'Light Blue', filename: 'light-blue.png' },
      { name: 'Pink', filename: 'pink.png' },
    ],
    brand: {
      name: 'LAT Apparel',
      identifier: 'LA',
    },
    identifiers: {
      mpn: '3322',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 12,
      height: 18,
      units: 'in',
    },
    weight: {
      value: 0.15,
      units: 'kg',
    },
    pricing: generatePricingArray(66),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
  // Kids
  'A-KT-GD64000B': {
    sku: 'A-KT-GD64000B',
    name: "Kids' T-Shirt",
    shortDescription: 'Classic youth t-shirt with durable construction',
    features: [
      'Seamless double-needle 7/8" collar',
      'Taped neck and shoulders',
      'Double-needle sleeve and bottom hems',
      'Quarter-turned to eliminate center crease',
      'Youth sizing for perfect fit',
    ],
    manufacturingLocation: 'Multiple locations worldwide',
    materials: [
      '100% preshrunk cotton',
      'Sport Grey: 90% cotton, 10% polyester',
      'Safety colors: 50% cotton, 50% polyester',
    ],
    ecoProperties: [
      'CPSIA compliant',
      'Kid-safe materials',
      'WRAP certified manufacturing',
    ],
    careInstructions: [
      'Machine wash warm, inside out',
      'Use non-chlorine bleach when needed',
      'Tumble dry medium',
      'Do not iron decoration',
      'Do not dry clean',
    ],
    pdfUrl:
      'https://www.prodigi.com/download/product-range/Prodigi%20Gildan%2064000B.pdf',
    size: ['3-4Y', '5-6Y', '7-8Y', '9-11Y', '12-13Y'],
    productType: 'KIDS_T_SHIRT',
    category: "Kids' T-shirts",
    imageUrls: {
      base: '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/A-KT-GD64000B/Blanks/png',
      productImage: '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/A-KT-GD64000B/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/A-KT-GD64000B/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/A-KT-GD64000B/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Black', filename: 'black.png' },
      { name: 'Charcoal', filename: 'charcoal.png' },
      { name: 'Daisy', filename: 'daisy.png' },
      { name: 'Light Blue', filename: 'light-blue.png' },
      { name: 'Navy', filename: 'navy.png' },
      { name: 'Purple', filename: 'purple.png' },
      { name: 'Red', filename: 'red.png' },
      { name: 'Royal', filename: 'royal.png' },
      { name: 'Sport Grey', filename: 'sport-grey.png' },
    ],
    brand: {
      name: 'Gildan',
      identifier: 'GIL',
    },
    identifiers: {
      mpn: '64000B',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 16,
      height: 24,
      units: 'in',
    },
    weight: {
      value: 0.2,
      units: 'kg',
    },
    pricing: generatePricingArray(66),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
  'SWEAT-AWD-JH030B': {
    sku: 'SWEAT-AWD-JH030B',
    name: "Kids' Sweatshirt",
    shortDescription:
      'Premium kids sweatshirt with modern fit and superior comfort',
    features: [
      'Double fabric hood with self-colored cords',
      'Kangaroo pouch pocket',
      'Ribbed cuffs and hem',
      'Twin needle stitching detailing',
      'Brushed inner fleece',
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
      'https://www.prodigi.com/download/product-range/Prodigi%20AWDis%20JH030J.pdf',
    size: ['3-4Y', '5-6Y', '7-8Y', '9-11Y', '12-13Y'],
    productType: 'KIDS_SWEATSHIRT',
    category: "Kids' Sweatshirts",
    imageUrls: {
      base: '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/SWEAT-AWD-JH030B/Blanks/png',
      productImage: '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/SWEAT-AWD-JH030B/ProductImage/image.png',
      cover:
        '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/SWEAT-AWD-JH030B/Blanks/cover',
      sizeChart:
        '/assets/images/Apparel/Kids+Babies/Kids/T-Shirts/SWEAT-AWD-JH030B/Blanks/size-chart.png',
    },
    colorOptions: [
      { name: 'Arctic White', filename: 'arctic-white.png' },
      { name: 'Jet Black', filename: 'jet-black.png' },
      { name: 'Royal Blue', filename: 'royal-blue.png' },
      { name: 'Bottle Green', filename: 'bottle-green.png' },
      { name: 'Kelly Green', filename: 'kelly-green.png' },
      { name: 'Sky Blue', filename: 'sky-blue.png' },
      { name: 'Charcoal', filename: 'charcoal.png' },
      { name: 'Oxford Navy', filename: 'oxford-navy.png' },
      { name: 'Sun Yellow', filename: 'sun-yellow.png' },
      { name: 'Heather Grey', filename: 'heather-grey.png' },
      { name: 'Red', filename: 'red.png' },
    ],
    brand: {
      name: 'AWDis',
      identifier: 'AWD',
    },
    identifiers: {
      mpn: 'JH030B',
    },
    availability: 'https://schema.org/InStock',
    dimensions: {
      width: 16,
      height: 24,
      units: 'in',
    },
    weight: {
      value: 0.4,
      units: 'kg',
    },
    pricing: generatePricingArray(68),
    shippingZones: baseShippingZones,
    vatIncluded: true,
    customsDutyInfo: baseCustomsDutyInfo,
    restrictions: {
      excludedCountries: [],
      maxQuantityPerOrder: 10,
    },
  },
};
