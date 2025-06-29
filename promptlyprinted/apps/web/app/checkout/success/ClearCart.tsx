'use client';

import { useCartStore } from '@/lib/cart-store';
import { useEffect } from 'react';

export function ClearCart() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
