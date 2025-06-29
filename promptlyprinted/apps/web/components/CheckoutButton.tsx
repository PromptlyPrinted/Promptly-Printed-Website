'use client';

import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@repo/design-system/components/ui/button';
import type { CheckoutItem } from '@/types/checkout';

interface CheckoutButtonProps {
  items: CheckoutItem[];
  variant?: 'default' | 'outline';
  className?: string;
}

export function CheckoutButton({
  items,
  variant = 'default',
  className,
}: CheckoutButtonProps) {
  const { initiateCheckout, isLoading } = useCheckout();

  return (
    <Button
      onClick={() => initiateCheckout(items)}
      variant={variant}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Buy Now'}
    </Button>
  );
}
