"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@repo/design-system/components/ui/button";
import { X } from "lucide-react";

type BasketDropdownProps = {
  headerBottom: number;
  onDropdownEnter: () => void;
  onDropdownLeave: () => void;
  isOpen: boolean;
  onClose: () => void;
};

export function BasketDropdown({
  headerBottom,
  onDropdownEnter,
  onDropdownLeave,
  isOpen,
  onClose,
}: BasketDropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and lock scrolling
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restore scrolling and scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      // Cleanup: ensure scroll is restored when component unmounts
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

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
        style={{ top: 0 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed right-0 z-50 w-[400px] bg-white shadow-lg border border-gray-200 rounded-lg mr-4 mt-4 max-h-[calc(100vh-2rem)] overflow-y-auto scroll-smooth
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
          [&::-webkit-scrollbar]:hover:w-2"
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
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-sm">You're £16.50 away from Free Shipping! 🚚</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className="h-full w-1/4 bg-green-500 rounded-full" />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-600">
              <span>£0</span>
              <span>£45</span>
              <span>£85</span>
            </div>
          </div>

          {/* Subscription Items */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Subscription purchases</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-black rounded-lg" />
                <div>
                  <h4 className="font-medium">Black Edition</h4>
                  <p className="text-gray-600">Banana</p>
                  <div className="flex items-center mt-1">
                    <select className="text-sm border rounded px-2 py-1">
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                    </select>
                    <span className="ml-4 text-gray-500">
                      Delivers every 4 weeks
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="line-through text-gray-500">£31.65</p>
                <p className="font-medium">£28.50</p>
              </div>
            </div>
          </div>

          {/* Welcome Kit */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg" />
              <div>
                <h4 className="font-medium">Welcome Kit</h4>
                <p className="text-sm text-gray-600">
                  Free T-shirt, welcome booklet, & more
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Welcome kit varies by basket; T-shirt size selected at checkout
                </p>
              </div>
              <div className="ml-auto">
                <p className="line-through text-gray-500">£30</p>
                <p className="font-medium">FREE</p>
              </div>
            </div>
          </div>

          {/* You'll love this section */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">You'll love this</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <img src="/vitamin-bottles.png" alt="Vitamins" className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="font-medium">3x Daily A-Z Vitamins</h4>
                  <p className="text-green-600 font-medium">£6.30</p>
                </div>
              </div>
              <Button variant="default" className="bg-black text-white hover:bg-gray-800">
                Add to bag
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>£31.65</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Sub-discount 10%</span>
              <span>-£3.15</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-gray-600">Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total</span>
              <span>£28.50</span>
            </div>
            <p className="text-sm text-gray-600">Discount codes applied at checkout</p>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-2 mt-4">
              <div className="p-2 bg-white border rounded">
                <img src="/payment-methods/visa.svg" alt="Visa" className="h-6" />
              </div>
              <div className="p-2 bg-white border rounded">
                <img src="/payment-methods/mastercard.svg" alt="Mastercard" className="h-6" />
              </div>
              <div className="p-2 bg-white border rounded">
                <img src="/payment-methods/apple-pay.svg" alt="Apple Pay" className="h-6" />
              </div>
              <div className="p-2 bg-white border rounded">
                <img src="/payment-methods/amex.svg" alt="American Express" className="h-6" />
              </div>
              <div className="p-2 bg-white border rounded">
                <img src="/payment-methods/paypal.svg" alt="PayPal" className="h-6" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              Checkout Securely
            </Button>
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
} 