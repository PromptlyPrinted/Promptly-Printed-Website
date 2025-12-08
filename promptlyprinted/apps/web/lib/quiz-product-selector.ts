/**
 * Product Selection Logic for Quiz Funnel
 * Maps user quiz answers to actual products from inventory
 */

export type QuizAnswers = {
  audience?: 'mens' | 'womens' | 'kids' | 'babies';
  styleType?:
    | 'classic-tee'
    | 'v-neck'
    | 'triblend'
    | 'tank-top'
    | 'long-sleeve'
    | 'hoodie'
    | 'sweatshirt'
    | 'bodysuit'
    | 'baseball-tee';
  theme?: 'halloween' | 'everyday' | 'christmas' | 'summer' | 'custom';
  aiModel?: 'flux-dev' | 'lora-normal' | 'lora-context' | 'nano-banana' | 'nano-banana-pro';
  colorPreference?: string; // Actual color name from product
  vibe?: string; // Existing quiz field
  designPersonality?: string; // Existing quiz field
  campaign?: string;
};

/**
 * Product SKU mapping based on quiz answers
 * Maps audience + styleType to actual product SKUs
 */
const PRODUCT_SKU_MAP: Record<string, Record<string, string>> = {
  mens: {
    'classic-tee': 'TEE-SS-STTU755', // Men's Classic T-Shirt
    'triblend': 'GLOBAL-TEE-BC-3413', // Men's Triblend T-Shirt
    'tank-top': 'TT-GIL-64200', // Men's Tank Top
    'v-neck': 'GLOBAL-TEE-GIL-64V00', // Men's V-Neck T-Shirt
    'long-sleeve': 'A-ML-GD2400', // Men's Long Sleeve T-Shirt
    hoodie: 'A-MH-JH001', // Men's Pullover Hoodie
    'baseball-tee': 'AU3-TEE-U-B-3200', // Baseball top
  },
  womens: {
    'classic-tee': 'A-WT-GD64000L', // Women's Classic T-Shirt
    'v-neck': 'GLOBAL-TEE-BC-6035', // Women's V-Neck T-Shirt
    hoodie: 'A-WH-JH001F', // Women's Hoodie
  },
  kids: {
    'classic-tee': 'A-KT-GD64000B', // Kids' T-Shirt
    hoodie: 'HOOD-AWD-JH001B', // Kids Hoodie
    sweatshirt: 'SWEAT-AWD-JH030B', // Kids Sweatshirt
  },
  babies: {
    bodysuit: 'A-BB-LA4411', // Baby Bodysuit
    'classic-tee': 'GLOBAL-TEE-RS-3322', // Baby T-Shirt
  },
};

/**
 * AI Model descriptions for quiz selection
 */
export const AI_MODEL_INFO = {
  'flux-dev': {
    name: 'Flux Dev',
    description: 'Versatile and balanced - great for most designs',
    strengths: 'General purpose, high quality, fast generation',
    bestFor: 'Everyday designs, logos, illustrations',
    credits: 1, // Standard 1 credit per generation
  },
  'lora-normal': {
    name: 'LORA Normal',
    description: 'Enhanced detail and artistic flair',
    strengths: 'Artistic styles, intricate details, vibrant colors',
    bestFor: 'Complex artwork, character designs',
    credits: 1, // Standard 1 credit per generation
  },
  'lora-context': {
    name: 'LORA Context',
    description: 'Smart contextual understanding',
    strengths: 'Scene composition, thematic coherence, storytelling',
    bestFor: 'Narrative designs, themed collections',
    credits: 1, // Standard 1 credit per generation
  },
  'nano-banana': {
    name: 'Nano Banana',
    description: 'Fast and efficient for quick results',
    strengths: 'Ultra-fast generation, clean outputs, cost-effective',
    bestFor: 'Simple designs, text-heavy, minimalist',
    credits: 0.5, // Half credit - budget option
  },
  'nano-banana-pro': {
    name: 'Nano Banana Pro',
    description: 'Premium quality with enhanced detail and faster speed',
    strengths: 'High-quality outputs, versatile, excellent prompt adherence',
    bestFor: 'Professional designs, detailed artwork, commercial use',
    credits: 2, // Premium tier - 2 credits per generation
  },
};

/**
 * Theme-specific prompt modifiers
 */
const THEME_MODIFIERS: Record<string, string> = {
  halloween:
    'with spooky Halloween theme, featuring pumpkins, ghosts, or dark atmospheric elements',
  christmas:
    'with festive Christmas theme, featuring winter elements, holiday cheer, and seasonal colors',
  summer: 'with bright summer vibes, beach elements, sunshine, and tropical colors',
  everyday: 'versatile for everyday wear with timeless appeal',
  custom: '', // No modifier, user has full control
};

/**
 * Giveaway products based on purchase tier
 * 
 * IMPORTANT: Only ONE discount can be applied per order.
 * - URL-based discounts (from quiz/offer flow) use the giveawayTier parameter
 * - Manual discount codes entered at checkout will REPLACE any URL-based discount
 * - The checkout page enforces this via the single `appliedDiscount` state
 * 
 * Products referenced:
 * - GLOBAL-STI-3X4-G: Sticker sheet (~$3-5 cost)
 * - GLOBAL-POST-MOH-6X4: Postcard (~$2-3 cost)
 * - GLOBAL-TATT-S: Temporary Tattoo (~$2 cost)
 * - PLA-KEYRING: Custom Keyring (~$5-8 cost)
 * - H-COAST-2PK: Coaster set (~$6-10 cost)
 */
export const GIVEAWAY_ITEMS = {
  // ===== STANDARD TIERS (evergreen) =====
  standard: {
    products: ['GLOBAL-STI-3X4-G'], // Free sticker sheet
    discount: 0.15, // 15% off - baseline for organic visitors
    name: 'Welcome Discount',
    description: 'Thanks for visiting! Enjoy 15% off your first design.',
    badgeColor: 'bg-blue-500',
  },
  emailCapture: {
    products: ['GLOBAL-STI-3X4-G', 'GLOBAL-POST-MOH-6X4'], // Sticker + Postcard
    discount: 0.25, // 25% off for email subscribers
    name: 'Subscriber Special',
    description: 'Exclusive subscriber discount + bonus gifts!',
    badgeColor: 'bg-purple-500',
  },
  firstPurchase: {
    products: ['GLOBAL-STI-3X4-G', 'GLOBAL-TATT-S'], // Sticker + Temporary Tattoo
    discount: 0.30, // 30% off for first-time buyers
    name: 'First Timer Deal',
    description: 'Your first order deserves something special!',
    badgeColor: 'bg-green-500',
  },
  
  // ===== CAMPAIGN TIERS (seasonal/promotional) =====
  campaign: {
    products: ['GLOBAL-STI-3X4-G', 'PLA-KEYRING'], // Sticker + Keyring
    discount: 0.35, // 35% off (campaign-specific)
    name: 'Campaign Exclusive',
    description: 'Limited-time campaign offer with free keyring!',
    badgeColor: 'bg-orange-500',
  },
  
  // ===== CHRISTMAS 2025 TIERS =====
  christmasQuiz: {
    products: ['GLOBAL-STI-3X4-G', 'PLA-KEYRING'], // Sticker + Custom Keyring
    discount: 0.35, // 35% off for quiz completers
    name: 'Christmas Quiz Reward',
    description: "You've unlocked 35% OFF + a FREE custom keyring with your design!",
    badgeColor: 'bg-red-500',
    isChristmas: true,
  },
  christmasPremium: {
    products: ['GLOBAL-STI-3X4-G', 'PLA-KEYRING', 'H-COAST-2PK'], // Sticker + Keyring + Coasters
    discount: 0.40, // 40% off for premium Christmas offer
    name: 'Christmas VIP Offer',
    description: '40% OFF + FREE keyring & coaster set! Our best Christmas deal.',
    badgeColor: 'bg-gradient-to-r from-red-500 to-green-500',
    isChristmas: true,
  },
  christmasBogo: {
    products: ['GLOBAL-STI-3X4-G'], // Free sticker (the BOGO is the main offer)
    discount: 0.50, // Effectively 50% off (BOGO = 2 for price of 1)
    name: '🎄 Buy One, Get One FREE',
    description: 'Buy any T-shirt, get a second T-shirt absolutely FREE! Limited time only.',
    badgeColor: 'bg-gradient-to-r from-green-600 to-red-600',
    isChristmas: true,
    isBogo: true, // Flag to handle BOGO logic at checkout
    bogoRules: {
      qualifyingProducts: ['T_SHIRT', 'LONG_SLEEVE_T_SHIRT'], // Product types that qualify
      freeProductSku: null, // null = same product, or specify SKU for specific free item
      maxFreeItems: 1, // Max free items per order
    },
  },
  
  // ===== BUNDLE TIERS =====
  bundle: {
    products: ['PLA-KEYRING', 'H-COAST-2PK'], // Keyring + Coaster set per item
    discount: 0.40, // 40% off when buying 2+
    name: 'Bundle Deal',
    description: 'Buy 2+ items and save 40% + get bonus gifts!',
    badgeColor: 'bg-indigo-500',
  },
  familyBundle: {
    products: ['GLOBAL-STI-3X4-G', 'PLA-KEYRING', 'H-COAST-2PK', 'GLOBAL-TATT-S'],
    discount: 0.45, // 45% off for family bundles (3+ items)
    name: 'Family Bundle Special',
    description: '45% OFF when you buy for the whole family! Plus 4 FREE gifts.',
    badgeColor: 'bg-pink-500',
  },
};

/**
 * Select the appropriate product SKU based on quiz answers
 */
export function selectProductFromQuiz(answers: QuizAnswers): string | null {
  const audience = answers.audience || 'mens';
  const styleType = answers.styleType || 'classic-tee';

  const audienceMap = PRODUCT_SKU_MAP[audience];
  if (!audienceMap) {
    console.warn(`No product mapping found for audience: ${audience}`);
    return PRODUCT_SKU_MAP.mens['classic-tee']; // Fallback to men's classic tee
  }

  const sku = audienceMap[styleType];
  if (!sku) {
    console.warn(
      `No product found for ${audience} + ${styleType}, using fallback`
    );
    // Fallback to first available product for that audience
    return Object.values(audienceMap)[0] || PRODUCT_SKU_MAP.mens['classic-tee'];
  }

  return sku;
}

/**
 * Generate AI prompt with theme and model considerations
 */
export function generateAIPrompt(answers: QuizAnswers): string {
  const vibeMap: Record<string, string> = {
    // Original vibes (kept for backwards compatibility)
    minimalist: 'minimal geometric design with clean lines and negative space',
    streetwear: 'bold urban streetwear graphic with graffiti-inspired elements',
    graphic: 'eye-catching graphic illustration with detailed artwork',
    surreal: 'dreamlike surreal artwork with abstract flowing elements',
    futuristic: 'futuristic tech-inspired design with cyberpunk aesthetics',
    // NEW: Christmas-themed vibes
    'cozy-traditional': 'warm cozy Christmas design with classic holiday elements like fireplaces, stockings, and warm lighting',
    'festive-fun': 'playful cheerful Christmas design with Santa, elves, and joyful holiday spirit',
    'winter-wonderland': 'magical snowy winter scene with snowflakes, pine trees, and sparkling frost',
    'modern-minimal': 'sleek contemporary Christmas design with clean lines and subtle holiday touches',
    'retro-vintage': 'nostalgic vintage Christmas design with classic 1950s retro holiday aesthetic',
  };

  const designPersonalityMap: Record<string, string> = {
    // Original personalities (kept for backwards compatibility)
    'simple-logo': 'as a clean minimalist logo',
    illustration: 'as a detailed hand-drawn illustration',
    'abstract-art': 'as abstract artistic patterns',
    'text-heavy': 'with bold typography and text elements',
    character: 'featuring a unique character design',
    // NEW: Christmas-themed personalities
    'cute-characters': 'featuring adorable Christmas characters like Santa Claus, reindeer, snowmen, and elves',
    'festive-typography': 'with beautiful hand-lettered Christmas quotes and holiday greetings',
    'christmas-scene': 'depicting a magical Christmas scene with snow, decorated trees, and cozy winter landscapes',
    'ugly-sweater': 'in classic ugly Christmas sweater style with tacky fun patterns and holiday motifs',
    'elegant-ornaments': 'featuring sophisticated Christmas ornaments, bells, and elegant holiday décor',
  };

  const vibe = answers.vibe ? vibeMap[answers.vibe] : 'creative design';
  const personality = answers.designPersonality
    ? designPersonalityMap[answers.designPersonality]
    : 'with artistic flair';
  const themeModifier = answers.theme ? THEME_MODIFIERS[answers.theme] : '';

  // Build base prompt
  let prompt = `Create a ${vibe} ${personality}`;

  // Add theme modifier if present
  if (themeModifier) {
    prompt += ` ${themeModifier}`;
  }

  // Add color preference if specified
  if (answers.colorPreference) {
    prompt += `, focusing on ${answers.colorPreference} tones`;
  }

  // Add optimization for apparel
  prompt +=
    '. Optimize for apparel print with high contrast and bold details suitable for t-shirt printing.';

  // Add AI model-specific guidance
  if (answers.aiModel) {
    const modelInfo = AI_MODEL_INFO[answers.aiModel];
    if (modelInfo.bestFor) {
      prompt += ` Style should emphasize: ${modelInfo.bestFor}.`;
    }
  }

  return prompt;
}

/**
 * Determine giveaway tier based on user context
 */
export function determineGiveawayTier(context: {
  isFirstPurchase?: boolean;
  hasEmailCaptured?: boolean;
  isCampaign?: boolean;
  itemCount?: number;
  campaign?: string; // e.g., 'christmas-2025', 'halloween-2025'
  offerType?: 'standard' | 'premium' | 'bogo'; // For Christmas, allow tier selection
}): keyof typeof GIVEAWAY_ITEMS {
  // Christmas 2025 campaign logic
  if (context.campaign === 'christmas-2025' || context.isCampaign) {
    // Check for BOGO offer
    if (context.offerType === 'bogo') return 'christmasBogo';
    // Check for premium Christmas offer
    if (context.offerType === 'premium') return 'christmasPremium';
    // Default Christmas quiz offer
    if (context.campaign === 'christmas-2025') return 'christmasQuiz';
  }
  
  // Bundle logic (3+ items = family bundle, 2+ = standard bundle)
  if (context.itemCount && context.itemCount >= 3) return 'familyBundle';
  if (context.itemCount && context.itemCount >= 2) return 'bundle';
  
  // Standard progression
  if (context.isFirstPurchase) return 'firstPurchase';
  if (context.isCampaign) return 'campaign';
  if (context.hasEmailCaptured) return 'emailCapture';
  
  return 'standard';
}

/**
 * Get product display name for UI
 */
export function getProductDisplayName(
  audience?: string,
  styleType?: string
): string {
  const audienceNames: Record<string, string> = {
    mens: "Men's",
    womens: "Women's",
    kids: "Kids'",
    babies: "Baby's",
  };

  const styleNames: Record<string, string> = {
    'classic-tee': 'Classic T-Shirt',
    'v-neck': 'V-Neck T-Shirt',
    triblend: 'Triblend T-Shirt',
    'tank-top': 'Tank Top',
    'long-sleeve': 'Long Sleeve T-Shirt',
    hoodie: 'Hoodie',
    sweatshirt: 'Sweatshirt',
    bodysuit: 'Bodysuit',
    'baseball-tee': 'Baseball T-Shirt',
  };

  const audienceName = audience ? audienceNames[audience] : "Men's";
  const styleName = styleType ? styleNames[styleType] : 'Classic T-Shirt';

  return `${audienceName} ${styleName}`;
}
