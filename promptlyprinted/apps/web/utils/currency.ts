interface Country {
  code: string;
  currency: string;
  name: string;
}

// All supported countries with their names and currencies
export const SUPPORTED_COUNTRIES: Country[] = [
  // USD Countries
  { code: 'US', currency: 'USD', name: 'United States' },

  // GBP Countries
  { code: 'GB', currency: 'GBP', name: 'United Kingdom' },

  // EUR Countries (Eurozone - all countries using Euro)
  { code: 'AT', currency: 'EUR', name: 'Austria' },
  { code: 'BE', currency: 'EUR', name: 'Belgium' },
  { code: 'HR', currency: 'EUR', name: 'Croatia' },
  { code: 'CY', currency: 'EUR', name: 'Cyprus' },
  { code: 'EE', currency: 'EUR', name: 'Estonia' },
  { code: 'FI', currency: 'EUR', name: 'Finland' },
  { code: 'FR', currency: 'EUR', name: 'France' },
  { code: 'DE', currency: 'EUR', name: 'Germany' },
  { code: 'GR', currency: 'EUR', name: 'Greece' },
  { code: 'IE', currency: 'EUR', name: 'Ireland' },
  { code: 'IT', currency: 'EUR', name: 'Italy' },
  { code: 'LV', currency: 'EUR', name: 'Latvia' },
  { code: 'LT', currency: 'EUR', name: 'Lithuania' },
  { code: 'LU', currency: 'EUR', name: 'Luxembourg' },
  { code: 'MT', currency: 'EUR', name: 'Malta' },
  { code: 'NL', currency: 'EUR', name: 'Netherlands' },
  { code: 'PT', currency: 'EUR', name: 'Portugal' },
  { code: 'SK', currency: 'EUR', name: 'Slovakia' },
  { code: 'SI', currency: 'EUR', name: 'Slovenia' },
  { code: 'ES', currency: 'EUR', name: 'Spain' },

  // Other European Countries (not in Eurozone)
  { code: 'BG', currency: 'BGN', name: 'Bulgaria' },
  { code: 'CZ', currency: 'CZK', name: 'Czech Republic' },
  { code: 'DK', currency: 'DKK', name: 'Denmark' },
  { code: 'HU', currency: 'HUF', name: 'Hungary' },
  { code: 'NO', currency: 'NOK', name: 'Norway' },
  { code: 'PL', currency: 'PLN', name: 'Poland' },
  { code: 'RO', currency: 'RON', name: 'Romania' },
  { code: 'SE', currency: 'SEK', name: 'Sweden' },
  { code: 'CH', currency: 'CHF', name: 'Switzerland' },

  // Other Countries
  { code: 'AU', currency: 'AUD', name: 'Australia' },
  { code: 'CA', currency: 'CAD', name: 'Canada' },
  { code: 'AE', currency: 'AED', name: 'United Arab Emirates' },
  { code: 'NZ', currency: 'NZD', name: 'New Zealand' },
  { code: 'KR', currency: 'KRW', name: 'South Korea' },
  { code: 'JP', currency: 'JPY', name: 'Japan' },
  { code: 'SG', currency: 'SGD', name: 'Singapore' },
  { code: 'CN', currency: 'CNY', name: 'China' },
];

// Group countries by currency
export const COUNTRIES_BY_CURRENCY = SUPPORTED_COUNTRIES.reduce(
  (acc, country) => {
    if (!acc[country.currency]) {
      acc[country.currency] = [];
    }
    acc[country.currency].push(country);
    return acc;
  },
  {} as Record<string, Country[]>
);

// Format price based on currency
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Convert price between currencies
// Base currency is USD - all prices should be stored in USD in database
export function convertPrice(
  price: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // Exchange rates as of December 2024 (1 USD = X in target currency)
  // TODO: Consider using a real-time exchange rate API for production
  const exchangeRates: Record<string, number> = {
    USD: 1.00,
    GBP: 0.79,
    EUR: 0.92,
    AUD: 1.52,
    CAD: 1.36,
    // Eurozone (all use EUR)
    // Non-Eurozone Europe
    BGN: 1.80,  // Bulgarian Lev
    CZK: 22.85, // Czech Koruna
    DKK: 6.86,  // Danish Krone
    HUF: 360.50, // Hungarian Forint
    NOK: 10.51, // Norwegian Krone
    PLN: 4.02,  // Polish Zloty
    RON: 4.58,  // Romanian Leu
    SEK: 10.37, // Swedish Krona
    CHF: 0.88,  // Swiss Franc
    // Other countries
    AED: 3.67,  // UAE Dirham
    CNY: 7.19,  // Chinese Yuan
    JPY: 150.41, // Japanese Yen
    KRW: 1331.89, // South Korean Won
    NZD: 1.64,  // New Zealand Dollar
    SGD: 1.34,  // Singapore Dollar
  };

  // If currencies are the same, return original price
  if (fromCurrency === toCurrency) {
    return price;
  }

  // Convert from source currency to USD first
  const usdAmount = price / (exchangeRates[fromCurrency] || 1);

  // Then convert from USD to target currency
  return usdAmount * (exchangeRates[toCurrency] || 1);
}

// Get default currency for a country
export function getDefaultCurrency(countryCode: string): string {
  const country = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);
  return country?.currency || 'USD';
}

// Check if a country is in the Eurozone
export function isEurozone(countryCode: string): boolean {
  const country = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);
  return country?.currency === 'EUR';
}

// Get all Eurozone countries
export function getEurozoneCountries(): Country[] {
  return SUPPORTED_COUNTRIES.filter((country) => country.currency === 'EUR');
}
