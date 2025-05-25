"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@repo/design-system/components/ui/button";
import { useCartStore, CartItem, getCartItemsWithImages } from "@/lib/cart-store";
import { CheckoutButton } from "@/components/CheckoutButton";
import Image from "next/image";

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
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
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
        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      <motion.div
        style={{ top: headerBottom + 16 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed right-0 z-50 w-[400px] bg-white shadow-lg border border-gray-200 rounded-lg mr-4 max-h-[calc(100vh-2rem)] overflow-y-auto scroll-smooth"
        onMouseEnter={onDropdownEnter}
        onMouseLeave={onDropdownLeave}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Basket</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {remainingForFreeShipping > 0 && (
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <p className="text-sm">
                {remainingForFreeShipping === shippingThreshold
                  ? "Add items to get free shipping! 🚚"
                  : `You're £${remainingForFreeShipping.toFixed(2)} away from Free Shipping! 🚚`}
              </p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${(subtotal / shippingThreshold) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>£0</span>
                <span>£{shippingThreshold}</span>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Your basket is empty
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-md overflow-hidden border border-gray-200">
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
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.size} • {item.color}
                    </p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
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
                <span>{remainingForFreeShipping === 0 ? "Free" : "Calculated at checkout"}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>

              {/* Checkout Buttons */}
              <div className="mt-4 space-y-2">
                <CheckoutButton
                  items={cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    copies: item.quantity,
                    color: item.color,
                    size: item.size,
                    images: [{ url: item.imageUrl }],
                    customization: item.customization,
                    recipientCostAmount: item.price,
                    currency: "USD",
                    merchantReference: `item_${item.productId}`,
                    sku: item.productId
                  }))}
                  className="w-full"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                >
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