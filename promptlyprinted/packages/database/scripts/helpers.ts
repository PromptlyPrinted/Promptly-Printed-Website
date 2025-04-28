export const exchangeRates = {
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
  KRW: 1335.50, // South Korean Won
  JPY: 150.55, // Japanese Yen
  SGD: 1.34, // Singapore Dollar
  CNY: 7.23 // Chinese Yuan
} as const;

export function convertFromUSD(amount: number, targetCurrency: keyof typeof exchangeRates): number {
  const rate = exchangeRates[targetCurrency];
  if (!rate) throw new Error(`Unsupported currency: ${targetCurrency}`);
  return amount * rate;
}

export function generatePricingArray(basePrice: number): Array<{ amount: number; currency: string }> {
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
    { amount: convertFromUSD(basePrice, 'CNY'), currency: 'CNY' }
  ];
}
