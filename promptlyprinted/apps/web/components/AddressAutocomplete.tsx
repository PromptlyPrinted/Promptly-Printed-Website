'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface AddressComponents {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void;
  placeholder?: string;
  className?: string;
  countryCode?: string; // ISO country code (e.g., 'GB', 'US', 'FR')
  language?: string; // Language code (e.g., 'en', 'fr', 'de')
}

interface GeoapifySuggestion {
  properties: {
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country_code?: string;
    county?: string;
    suburb?: string;
  };
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = 'Start typing your address...',
  className = '',
  countryCode,
  language = 'en',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (!apiKey) {
      setError('Geoapify API key not configured');
      return;
    }

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build API URL with filters
      let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query
      )}&apiKey=${apiKey}&format=json&limit=5`;

      // Add country filter if specified
      if (countryCode) {
        url += `&filter=countrycode:${countryCode.toLowerCase()}`;
      }

      // Add language
      url += `&lang=${language}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions');
      }

      const data = await response.json();
      
      if (data.results) {
        setSuggestions(data.results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to search addresses');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: GeoapifySuggestion) => {
    const props = suggestion.properties;

    // Parse address components
    const addressComponents: AddressComponents = {
      addressLine1: '',
      addressLine2: props.address_line2 || '',
      city: props.city || props.suburb || props.county || '',
      state: props.state || '',
      postalCode: props.postcode || '',
      country: props.country_code?.toUpperCase() || '',
    };

    // Build address line 1
    if (props.housenumber && props.street) {
      addressComponents.addressLine1 = `${props.housenumber} ${props.street}`;
    } else if (props.address_line1) {
      addressComponents.addressLine1 = props.address_line1;
    } else if (props.street) {
      addressComponents.addressLine1 = props.street;
    }

    console.log('Parsed address:', addressComponents);

    // Update input display
    setInputValue(props.formatted);
    setShowSuggestions(false);
    setSuggestions([]);

    // Call parent callback
    onAddressSelect(addressComponents);
  };

  // If API key not configured, show simple input
  if (!apiKey) {
    return (
      <div className={className}>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Address autocomplete unavailable - enter manually
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <Search className={`absolute left-3 top-3 h-5 w-5 text-gray-400 ${isLoading ? 'animate-pulse' : ''}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          onChange={handleInputChange}
          value={inputValue}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.properties.formatted}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status messages */}
      {isLoading && (
        <p className="text-xs text-gray-500 mt-1">Searching addresses...</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      {!isLoading && !error && inputValue.length > 0 && inputValue.length < 3 && (
        <p className="text-xs text-gray-500 mt-1">
          Type at least 3 characters to search
        </p>
      )}
      {!isLoading && !error && inputValue.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Start typing to search for your address
        </p>
      )}
    </div>
  );
}
