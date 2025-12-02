'use client';

import { useCountry } from '@/components/providers/CountryProvider';
import { convertPrice, formatPrice } from '@/utils/currency';

interface PriceDisplayProps {
  // IMPORTANT: All prices should be stored in USD in the database
  // This component converts USD to the user's selected currency
  amountUSD?: number;
  amountGBP?: number; // Deprecated - kept for backwards compatibility
  className?: string;
  showSecondary?: boolean;
}

export function PriceDisplay({ amountUSD, amountGBP, className, showSecondary = true }: PriceDisplayProps) {
  const { currency } = useCountry();

  // Use amountUSD if provided, otherwise fall back to amountGBP (legacy support)
  // If using amountGBP, convert it to USD first
  const priceInUSD = amountUSD ?? (amountGBP ? convertPrice(amountGBP, 'GBP', 'USD') : 0);

  // Convert from USD to user's currency
  const priceInUserCurrency = currency === 'USD'
    ? priceInUSD
    : convertPrice(priceInUSD, 'USD', currency);

  const primary = formatPrice(priceInUserCurrency, currency);

  let secondary: string | null = null;
  if (showSecondary && currency !== 'USD') {
    // Always show USD as secondary for non-USD users
    secondary = `≈ ${formatPrice(priceInUSD, 'USD')}`;
  }

  return (
    <div className={className}>
      <div className="font-semibold text-gray-900">{primary}</div>
      {secondary && (
        <div className="text-xs text-gray-500 leading-tight">{secondary}</div>
      )}
    </div>
  );
}

