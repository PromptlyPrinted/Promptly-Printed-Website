'use client';

import { useCountry } from '@/components/providers/CountryProvider';
import { convertPrice, formatPrice } from '@/utils/currency';

interface PriceDisplayProps {
  amountGBP: number;
  className?: string;
  showSecondary?: boolean;
}

export function PriceDisplay({ amountGBP, className, showSecondary = true }: PriceDisplayProps) {
  const { currency } = useCountry();

  const primary = formatPrice(
    currency === 'GBP' ? amountGBP : convertPrice(amountGBP, 'GBP', currency),
    currency
  );

  let secondary: string | null = null;
  if (showSecondary) {
    if (currency === 'GBP') {
      const usd = convertPrice(amountGBP, 'GBP', 'USD');
      secondary = `≈ ${formatPrice(usd, 'USD')}`;
    } else {
      secondary = `≈ ${formatPrice(amountGBP, 'GBP')}`;
    }
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

