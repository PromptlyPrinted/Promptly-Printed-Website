import { useState, useEffect } from 'react';

interface ExchangeRates {
  [key: string]: number;
}

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // You'll need to sign up for an API key at exchangerate-api.com or similar service
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data.rates) {
          setRates(data.rates);
          setError(null);
        } else {
          setError('Failed to fetch exchange rates');
        }
      } catch (err) {
        setError('Failed to fetch exchange rates');
        // Fallback to static rates if API fails
        setRates({
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
          CNY: 7.19
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      return amount;
    }
    
    const inUSD = amount / rates[fromCurrency];
    return inUSD * rates[toCurrency];
  };

  return {
    rates,
    loading,
    error,
    convertPrice
  };
} 