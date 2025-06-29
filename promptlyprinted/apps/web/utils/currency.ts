interface Country {
  code: string;
  currency: string;
  name: string;
}

// All supported countries with their names and currencies
export const SUPPORTED_COUNTRIES: Country[] = [
  { code: 'US', currency: 'USD', name: 'United States' },
  { code: 'GB', currency: 'GBP', name: 'United Kingdom' },
  { code: 'DE', currency: 'EUR', name: 'Germany' },
  { code: 'FR', currency: 'EUR', name: 'France' },
  { code: 'IT', currency: 'EUR', name: 'Italy' },
  { code: 'ES', currency: 'EUR', name: 'Spain' },
  { code: 'NL', currency: 'EUR', name: 'Netherlands' },
  { code: 'BE', currency: 'EUR', name: 'Belgium' },
  { code: 'IE', currency: 'EUR', name: 'Ireland' },
  { code: 'AT', currency: 'EUR', name: 'Austria' },
  { code: 'PT', currency: 'EUR', name: 'Portugal' },
  { code: 'FI', currency: 'EUR', name: 'Finland' },
  { code: 'GR', currency: 'EUR', name: 'Greece' },
  { code: 'AU', currency: 'AUD', name: 'Australia' },
  { code: 'CH', currency: 'CHF', name: 'Switzerland' },
  { code: 'SE', currency: 'SEK', name: 'Sweden' },
  { code: 'AE', currency: 'AED', name: 'United Arab Emirates' },
  { code: 'DK', currency: 'DKK', name: 'Denmark' },
  { code: 'NO', currency: 'NOK', name: 'Norway' },
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

// Convert price between currencies (you'll need to implement real exchange rates)
export function convertPrice(
  price: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // This is a placeholder - you should use real exchange rates from an API
  const exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.52,
    CHF: 0.88,
    SEK: 10.37,
    AED: 3.67,
    DKK: 6.86,
    NOK: 10.51,
    NZD: 1.64,
    KRW: 1331.89,
    JPY: 150.41,
    SGD: 1.34,
    CNY: 7.19,
  };

  const usdAmount = price / (exchangeRates[fromCurrency] || 1);
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
