// header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@repo/auth/client";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Menu,
  X,
  User,
  Search,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PromptlyLogo from "./PromptlyLogo.svg";
import { ResourcesDropdown } from "./ResourcesDropdown";
import { ProductsDropdown } from "./ProductsDropdown";
import { BasketDropdown } from "./BasketDropdown";
import { ProfileDropdown } from "./ProfileDropdown";

const navigationItems = [
  { name: "Home", href: "/" },
  {
    name: "Products",
    isProducts: true, // Special flag to identify the Products item
  },
  {
    name: "Resources",
    // The original subItems are now replaced by the custom ResourcesDropdown
    subItems: [
      { name: "Blog", href: "/blog" },
      { name: "Size & Fit", href: "/size-fit" },
      { name: "FAQs", href: "/faqs" },
      { name: "Affiliate Program", href: "/affiliate" },
    ],
  },
  { name: "About Us", href: "/about" },
  {
    name: "Design Your Apparel",
    href: "/design",
    isButton: true,
  },
];

const profileItems = [
  { name: "Profile", href: "/profile" },
  { name: "My Images", href: "/my-images" },
  { name: "My Designs", href: "/my-designs" },
  { name: "Orders", href: "/orders" },
];

const brandAccentColor = "bg-teal-500 hover:bg-teal-600 text-white";

export const Header = () => {
  const { isSignedIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Refs for timeouts
  const profileTimeoutRef = useRef<NodeJS.Timeout>();
  const basketTimeoutRef = useRef<NodeJS.Timeout>();
  const headerRef = useRef<HTMLDivElement>(null);
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const resourcesLeaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setHeaderBottom(rect.bottom + window.scrollY);
    }
  }, []);

  const handleProfileMouseEnter = () => {
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
    }
    setProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 150);
  };

  const handleBasketMouseEnter = () => {
    if (basketTimeoutRef.current) {
      clearTimeout(basketTimeoutRef.current);
    }
    setBasketOpen(true);
  };

  const handleBasketMouseLeave = () => {
    basketTimeoutRef.current = setTimeout(() => {
      setBasketOpen(false);
    }, 150);
  };

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      if (basketTimeoutRef.current) clearTimeout(basketTimeoutRef.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
      if (resourcesLeaveTimeout.current) clearTimeout(resourcesLeaveTimeout.current);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleDropdownToggle = (index: number) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  // When entering either the Products trigger or dropdown, clear any timeout and open immediately.
  const handleDropdownEnter = () => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setProductsOpen(true);
  };

  // On mouse leave, start a timeout before closing the Products dropdown.
  const handleDropdownLeave = () => {
    leaveTimeout.current = window.setTimeout(() => {
      setProductsOpen(false);
    }, 200);
  };

  // Add handlers for Resources dropdown
  const handleResourcesEnter = () => {
    if (resourcesLeaveTimeout.current) {
      clearTimeout(resourcesLeaveTimeout.current);
      resourcesLeaveTimeout.current = null;
    }
    setResourcesOpen(true);
  };

  const handleResourcesLeave = () => {
    resourcesLeaveTimeout.current = window.setTimeout(() => {
      setResourcesOpen(false);
    }, 200);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="w-full border-b border-gray-200 bg-white relative z-40"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Image
                src={PromptlyLogo}
                alt="Promptly Logo"
                className="h-28 w-28"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden flex-1 items-center justify-center lg:flex lg:space-x-6">
            {/* Other navigation items */}
            {navigationItems.map((navItem, index) => {
              // For Products item
              if (navItem.isProducts) {
                return (
                  <div key={navItem.name} className="relative">
                    <button
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                      onClick={() => setProductsOpen((prev) => !prev)}
                      className="flex items-center space-x-1 font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                    >
                      <span>{navItem.name}</span>
                    </button>
                  </div>
                );
              }
              // For the Resources item
              if (navItem.name === "Resources") {
                return (
                  <div key={navItem.name} className="relative">
                    <button
                      onMouseEnter={handleResourcesEnter}
                      onMouseLeave={handleResourcesLeave}
                      onClick={() => setResourcesOpen((prev) => !prev)}
                      className="flex items-center space-x-1 font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                    >
                      <span>{navItem.name}</span>
                    </button>
                  </div>
                );
              }
              // For any other navigation item that has subItems (if any)
              if (navItem.subItems) {
                return (
                  <div key={navItem.name} className="relative">
                    <button
                      onMouseEnter={() => handleDropdownToggle(index)}
                      onMouseLeave={() => handleDropdownToggle(index)}
                      onClick={() => handleDropdownToggle(index)}
                      className="flex items-center space-x-1 font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                    >
                      <span>{navItem.name}</span>
                    </button>
                    {dropdownOpenIndex === index && (
                      <div
                        onMouseEnter={() => setDropdownOpenIndex(index)}
                        onMouseLeave={() => setDropdownOpenIndex(null)}
                        className="absolute left-0 top-10 z-50 w-64 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5"
                      >
                        {navItem.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              if (navItem.isButton) {
                return (
                  <Button
                    key={navItem.name}
                    asChild
                    variant="default"
                    className={brandAccentColor}
                  >
                    <Link href={navItem.href}>{navItem.name}</Link>
                  </Button>
                );
              }
              return (
                <Link
                  key={navItem.name}
                  href={navItem.href || "#"}
                  className="font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
                >
                  {navItem.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Icons/Buttons */}
          <div className="hidden items-center space-x-4 lg:flex">
            <button className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md">
              <Search />
            </button>

            {/* Profile Icon */}
            {isClient ? (
              <div 
                className="relative"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
              >
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                >
                  <User />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                >
                  <User />
                </button>
              </div>
            )}

            {/* Shopping Cart */}
            {isClient ? (
              <div 
                className="relative"
                onMouseEnter={handleBasketMouseEnter}
                onMouseLeave={handleBasketMouseLeave}
              >
                <button
                  onClick={() => setBasketOpen(!basketOpen)}
                  className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                >
                  <ShoppingCart />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                >
                  <ShoppingCart />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex items-center text-gray-700 hover:text-gray-900 lg:hidden p-2 rounded-md"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* (Mobile menu code omitted for brevity) */}

      {/* Only render dropdowns on client side */}
      {isClient && (
        <>
          {/* Render the Products mega menu using a portal */}
          {productsOpen && (
            <ProductsDropdown
              headerBottom={headerBottom}
              onDropdownEnter={handleDropdownEnter}
              onDropdownLeave={handleDropdownLeave}
            />
          )}

          {/* Render the Resources dropdown via portal */}
          {resourcesOpen && (
            <ResourcesDropdown
              headerBottom={headerBottom}
              onDropdownEnter={handleResourcesEnter}
              onDropdownLeave={handleResourcesLeave}
            />
          )}

          {/* Render the Profile dropdown */}
          <ProfileDropdown
            headerBottom={headerBottom}
            onDropdownEnter={handleProfileMouseEnter}
            onDropdownLeave={handleProfileMouseLeave}
            isOpen={profileDropdownOpen}
            isSignedIn={isSignedIn}
            onSignOut={signOut}
          />

          {/* Render the Basket dropdown */}
          <BasketDropdown
            headerBottom={headerBottom}
            onDropdownEnter={handleBasketMouseEnter}
            onDropdownLeave={handleBasketMouseLeave}
            isOpen={basketOpen}
            onClose={() => setBasketOpen(false)}
          />
        </>
      )}
    </>
  );
};