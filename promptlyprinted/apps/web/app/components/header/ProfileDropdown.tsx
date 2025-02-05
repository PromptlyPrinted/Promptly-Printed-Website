"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@repo/design-system/components/ui/button";
import { User, Image, Package, Heart, Settings, LogOut } from "lucide-react";

type ProfileDropdownProps = {
  headerBottom: number;
  onDropdownEnter: () => void;
  onDropdownLeave: () => void;
  isOpen: boolean;
  isSignedIn: boolean;
  onSignOut: () => void;
};

export function ProfileDropdown({
  headerBottom,
  onDropdownEnter,
  onDropdownLeave,
  isOpen,
  isSignedIn,
  onSignOut,
}: ProfileDropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <motion.div
      style={{ top: headerBottom }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 z-50 w-[300px] bg-white shadow-lg border border-gray-200 rounded-lg mr-4"
      onMouseEnter={onDropdownEnter}
      onMouseLeave={onDropdownLeave}
    >
      <div className="p-4">
        {isSignedIn ? (
          <>
            {/* Signed In View */}
            <div className="flex items-center space-x-3 pb-4 border-b">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Welcome back!</h3>
                <p className="text-sm text-gray-500">Manage your account</p>
              </div>
            </div>

            <div className="py-3 space-y-1">
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link
                href="/my-images"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Image className="w-5 h-5" />
                <span>My Images</span>
              </Link>
              <Link
                href="/my-designs"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>My Designs</span>
              </Link>
              <Link
                href="/orders"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Package className="w-5 h-5" />
                <span>Orders</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>

            <div className="pt-3 border-t">
              <button
                onClick={onSignOut}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Sign In View */}
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Promptly</h3>
              <p className="text-sm text-gray-500 mb-4">Sign in to manage your account</p>
              <div className="space-y-3">
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`}>Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-up`}>Create Account</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>,
    document.body
  );
} 