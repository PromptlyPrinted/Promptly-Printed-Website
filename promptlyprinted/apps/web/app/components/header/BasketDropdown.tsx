'use client';

import { CheckoutButton } from '@/components/CheckoutButton';
import {
  type CartItem,
  getCartItemsWithImages,
  useCartStore,
} from '@/lib/cart-store';
import { Button } from '@repo/design-system/components/ui/button';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type BasketDropdownProps = {
  headerBottom: number;
  onDropdownEnter: () => void;
  onDropdownLeave: () => void;
  isOpen: boolean;
  onClose: () => void;
};

export const BasketDropdown = ({
  headerBottom,
  onDropdownEnter,
  onDropdownLeave,
  isOpen,
  onClose,
}: BasketDropdownProps) => {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadCartItems = async () => {
      const itemsWithImages = await getCartItemsWithImages();
      setCartItems(itemsWithImages);
    };
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen, items]);

  // Effect to handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, Number.parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const subtotal = getTotal();
  const shippingThreshold = 85;
  const remainingForFreeShipping = Math.max(0, shippingThreshold - subtotal);

  return createPortal(
    <>
      {/* Backdrop with blur effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        style={{ top: headerBottom + 16 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed right-0 z-50 mr-4 max-h-[calc(100vh-2rem)] w-[400px] overflow-y-auto scroll-smooth rounded-lg border border-gray-200 bg-white shadow-lg"
        onMouseEnter={onDropdownEnter}
        onMouseLeave={onDropdownLeave}
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-xl">Your Basket</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {remainingForFreeShipping > 0 && (
            <div className="mb-4 rounded-lg bg-green-50 p-3">
              <p className="text-sm">
                {remainingForFreeShipping === shippingThreshold
                  ? 'Add items to get free shipping! 🚚'
                  : `You're £${remainingForFreeShipping.toFixed(2)} away from Free Shipping! 🚚`}
              </p>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(subtotal / shippingThreshold) * 100}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-gray-600 text-xs">
                <span>£0</span>
                <span>£{shippingThreshold}</span>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Your basket is empty
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 96px) 100vw, 96px"
                      className="object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png'; // Fallback image
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-gray-600 text-sm">
                      {item.size} • {item.color}
                    </p>
                    <div className="mt-2 flex items-center">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="rounded p-1 hover:bg-gray-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="mx-2 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="rounded p-1 hover:bg-gray-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="mt-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {cartItems.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {remainingForFreeShipping === 0
                    ? 'Free'
                    : 'Calculated at checkout'}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium text-lg">
                <span>Total</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>

              {/* Checkout Buttons */}
              <div className="mt-4 space-y-2">
                <CheckoutButton
                  items={cartItems.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    copies: item.quantity,
                    color: item.color,
                    size: item.size,
                    images: [{ url: item.imageUrl }],
                    customization: item.customization,
                    recipientCostAmount: item.price,
                    currency: 'USD',
                    merchantReference: `item_${item.productId}`,
                    sku: item.productId,
                  }))}
                  className="w-full"
                />
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>,
    document.body
  );
};
