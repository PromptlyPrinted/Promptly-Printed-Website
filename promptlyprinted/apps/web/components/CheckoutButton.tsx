'use client';

import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@repo/design-system/components/ui/button';
import type { CheckoutItem } from '@/types/checkout';

interface CheckoutButtonProps {
  items: CheckoutItem[];
  variant?: 'default' | 'outline';
  className?: string;
  disabled?: boolean;
  onCheckoutStart?: () => void;
}

export function CheckoutButton({
  items,
  variant = 'default',
  className,
  disabled = false,
  onCheckoutStart,
}: CheckoutButtonProps) {
  const { initiateCheckout, isLoading } = useCheckout();

  const handleClick = () => {
    onCheckoutStart?.();
    initiateCheckout(items);
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={className}
      disabled={disabled || isLoading}
    >
      {isLoading ? 'Processing...' : 'Buy Now'}
    </Button>
  );
}
