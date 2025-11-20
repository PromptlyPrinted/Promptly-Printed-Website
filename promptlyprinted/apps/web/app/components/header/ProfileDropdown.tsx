'use client';

import { useSession } from '@repo/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, Image, LogOut, Package, Settings, Shield, User, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ProfileDropdownProps = {
  headerBottom: number;
  isOpen: boolean;
  isSignedIn: boolean;
  onSignOut: () => void;
  onClose: () => void;
};

function useUserRole() {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      setIsLoading(true);
      fetch('/api/user/role')
        .then(res => res.json())
        .then(data => setUserRole(data.role))
        .catch(error => console.error('Failed to fetch user role:', error))
        .finally(() => setIsLoading(false));
    }
  }, [session?.user?.id]);

  return { userRole, isLoading };
}

export function ProfileDropdown({
  headerBottom,
  isOpen,
  isSignedIn,
  onSignOut,
  onClose,
}: ProfileDropdownProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const isLoaded = true; // Better Auth loads immediately
  const [mounted, setMounted] = useState(false);
  const { userRole, isLoading } = useUserRole();

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
      window.scrollTo(0, Number.parseInt(scrollY || '0') * -1);
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
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        // Use fixed positioning so the dropdown follows the viewport.
        // We set the top to headerBottom (computed in the header)
        // and add a right offset (e.g. 16px) so it aligns with the header's profile icon.
        style={{ top: headerBottom, right: 16 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed z-50 w-[300px] rounded-lg border border-gray-200 bg-white shadow-lg"
      >
        <div className="relative p-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>

          {isSignedIn ? (
            <>
              {/* Signed In View */}
              <div className="flex items-center space-x-3 border-b pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {isLoaded && user
                      ? `Welcome back, ${user.name || user.email}!`
                      : 'Welcome back!'}
                  </h3>
                  <p className="text-gray-500 text-sm">Manage your account</p>
                </div>
              </div>

              <div className="space-y-1 py-3">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/my-images"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Image className="h-5 w-5" />
                  <span>My Images</span>
                </Link>
                <Link
                  href="/my-designs"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Heart className="h-5 w-5" />
                  <span>My Designs</span>
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Package className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
                {userRole === 'ADMIN' && (
                  <Link
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/admin`}
                    className="flex items-center space-x-3 rounded-md px-3 py-2 text-blue-700 bg-blue-50 transition-colors hover:bg-blue-100 border border-blue-200"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="border-t pt-3">
                <button
                  onClick={onSignOut}
                  className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Sign In View */}
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  Welcome to Promptly
                </h3>
                <p className="mb-4 text-gray-500 text-sm">
                  Sign in to manage your account
                </p>
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-up`}>
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>,
    document.body
  );
}
