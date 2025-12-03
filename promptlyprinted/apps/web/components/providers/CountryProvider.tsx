'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SUPPORTED_COUNTRIES, getDefaultCurrency } from '@/utils/currency';

interface CountryContextType {
  countryCode: string;
  currency: string;
  setCountry: (code: string) => void;
  isLoading: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { readonly children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<string>('US');
  const [currency, setCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get from localStorage first
    const savedCountry = localStorage.getItem('country');
    if (savedCountry) {
      setCountry(savedCountry);
      setIsLoading(false);
      return;
    }

    // If not in localStorage, fetch from IP via server-side proxy to avoid CORS
    // Use our own API endpoint that proxies the request server-side
    fetch('/api/geolocation')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Geolocation API returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.country_code) {
          // Check if we support this country
          const isSupported = SUPPORTED_COUNTRIES.some((c) => c.code === data.country_code);
          if (isSupported) {
            setCountry(data.country_code);
          } else {
            // Default to US if country not supported
            setCountry('US');
          }
        } else {
          // Default to US if no country code
          setCountry('US');
        }
      })
      .catch((err) => {
        console.error('Failed to detect country:', err);
        // Default to US on error
        setCountry('US');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setCountry = (code: string) => {
    const newCurrency = getDefaultCurrency(code);
    setCountryCode(code);
    setCurrency(newCurrency);
    localStorage.setItem('country', code);
  };

  return (
    <CountryContext.Provider value={{ countryCode, currency, setCountry, isLoading }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}
