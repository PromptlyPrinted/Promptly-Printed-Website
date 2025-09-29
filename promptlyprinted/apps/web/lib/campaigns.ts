export interface Campaign {
  id: string;
  name: string;
  dates: {
    start: string;
    end: string;
  };
  locations: string[];
  products: string[];
  themes: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  copy: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  discounts?: {
    percentage: number;
    code: string;
    minQuantity?: number;
  };
}

export const activeCampaigns: Record<string, Campaign> = {
  'halloween-2025-uk': {
    id: 'halloween-2025-uk',
    name: 'Fright Fest UK',
    dates: { start: '2025-10-01', end: '2025-11-01' },
    locations: ['GB', 'IE'],
    products: ['TEE-SS-STTU755', 'A-ML-GD2400', 'SWEAT-AWD-JH030B'],
    themes: ['gothic', 'british-halloween', 'bonfire-night', 'spooky'],
    colors: {
      primary: '#FF7900', // Pumpkin Orange
      secondary: '#A200FF', // Ghostly Purple
      accent: '#1C1C1C', // Midnight Black
    },
    copy: {
      headline: "Don't Be a Ghost. Design Your Halloween Look.",
      subheadline: "Create spooky masterpieces with AI. Fast UK delivery for Halloween.",
      cta: "Summon Your Design",
    },
    discounts: {
      percentage: 15,
      code: 'SPOOKY15',
      minQuantity: 1,
    },
  },

  'halloween-2025-us': {
    id: 'halloween-2025-us',
    name: 'Fright Fest USA',
    dates: { start: '2025-10-01', end: '2025-10-31' },
    locations: ['US'],
    products: ['TEE-SS-STTU755', 'GLOBAL-TEE-BC-3413', 'TT-GIL-64200'],
    themes: ['trick-or-treat', 'american-horror', 'pumpkin-patch', 'haunted'],
    colors: {
      primary: '#FF6600',
      secondary: '#8B0000',
      accent: '#000000',
    },
    copy: {
      headline: "Unleash Your Inner Monster This Halloween",
      subheadline: "AI-powered custom designs. Express shipping across America.",
      cta: "Create Your Costume",
    },
    discounts: {
      percentage: 20,
      code: 'TRICK20',
    },
  },

  'christmas-2025-global': {
    id: 'christmas-2025-global',
    name: 'Festive Creator Global',
    dates: { start: '2025-11-15', end: '2025-12-20' },
    locations: ['global'],
    products: ['TEE-SS-STTU755', 'A-ML-GD2400', 'A-WT-GD64000L', 'SWEAT-AWD-JH030B'],
    themes: ['festive', 'winter-wonderland', 'family-matching', 'cultural-christmas'],
    colors: {
      primary: '#C41E3A', // Christmas Red
      secondary: '#228B22', // Forest Green
      accent: '#FFD700', // Gold
    },
    copy: {
      headline: "Make This Christmas Uniquely Yours",
      subheadline: "Custom family designs with AI. Worldwide delivery before Christmas.",
      cta: "Design Your Holiday Magic",
    },
    discounts: {
      percentage: 25,
      code: 'MERRY25',
      minQuantity: 2,
    },
  },

  'summer-2026-au': {
    id: 'summer-2026-au',
    name: 'Summer Vibes Australia',
    dates: { start: '2025-12-01', end: '2026-02-28' },
    locations: ['AU', 'NZ'],
    products: ['TEE-SS-STTU755', 'TT-GIL-64200', 'GLOBAL-TEE-BC-6035'],
    themes: ['beach-vibes', 'summer-christmas', 'aussie-culture', 'surf-life'],
    colors: {
      primary: '#00BFFF', // Deep Sky Blue
      secondary: '#FFD700', // Gold
      accent: '#FF4500', // Orange Red
    },
    copy: {
      headline: "Summer Christmas Down Under",
      subheadline: "Unique Aussie designs for the summer season. Fast local delivery.",
      cta: "Create Your Summer Look",
    },
  },
};

// Helper functions
export function getCurrentCampaign(location: string): Campaign | null {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];

  for (const campaign of Object.values(activeCampaigns)) {
    const isDateActive = currentDate >= campaign.dates.start && currentDate <= campaign.dates.end;
    const isLocationMatch = campaign.locations.includes('global') || campaign.locations.includes(location);

    if (isDateActive && isLocationMatch) {
      return campaign;
    }
  }

  return null;
}

export function getCampaignByUtm(utmCampaign?: string): Campaign | null {
  if (!utmCampaign) return null;

  return Object.values(activeCampaigns).find(campaign =>
    campaign.id.includes(utmCampaign) ||
    campaign.name.toLowerCase().includes(utmCampaign.toLowerCase())
  ) || null;
}

export function getLocationFromIP(): Promise<string> {
  // Implement IP geolocation
  return Promise.resolve('GB'); // Default to UK
}