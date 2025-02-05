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
  ChevronDown, // For mobile accordion indicators
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
    // On desktop, ResourcesDropdown is used.
    // On mobile we use an accordion with detailed sub-items.
    subItems: [
      // These items will be replaced with a full mobile view below.
      { name: "Resources", href: "#" },
    ],
  },
  { name: "About Us", href: "/about" },
  {
    name: "Design Your Apparel",
    href: "/design",
    isButton: true,
  },
];

const brandAccentColor = "bg-teal-500 hover:bg-teal-600 text-white";

/**
 * Mobile-expanded view for Products
 */
const ProductsDropdownMobileExpanded = ({ onLinkClick }: { onLinkClick: () => void }) => {
  return (
    <div className="mt-2 space-y-4">
      {/* Section 1: Intro */}
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Use your imagination</h3>
        <p className="mt-1 text-sm text-gray-600">
          Discover unique products that spark creativity and imagination.
        </p>
        <Link
          href="/products/all"
          onClick={onLinkClick}
          className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:text-gray-700"
        >
          Explore Products →
        </Link>
      </div>

      {/* Section 2: Apparel */}
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Apparel</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/all"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              All
            </Link>
          </li>
          <li>
            <Link
              href="/products/mens"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Men
            </Link>
          </li>
          <li>
            <Link
              href="/products/womens"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Women
            </Link>
          </li>
          <li>
            <Link
              href="/products/kids+babies"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Kids &amp; Babies
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 3: Accessories */}
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Accessories</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/mats-sleeves"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Mats &amp; Sleeves
            </Link>
          </li>
          <li>
            <Link
              href="/products/socks-flipflops"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Socks &amp; Flip-flops
            </Link>
          </li>
          <li>
            <Link
              href="/products/pendants-keyrings"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Pendants &amp; Keyrings
            </Link>
          </li>
          <li>
            <Link
              href="/products/bags"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Bags
            </Link>
          </li>
          <li>
            <Link
              href="/products/watch-straps"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Apple Watch Straps
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 4: Home & Living */}
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Home &amp; Living</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/cushions"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Cushions
            </Link>
          </li>
          <li>
            <Link
              href="/products/gallery-boards"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Gallery Boards
            </Link>
          </li>
          <li>
            <Link
              href="/products/acrylic-prisms"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Acrylic Prisms
            </Link>
          </li>
          <li>
            <Link
              href="/products/prints-posters"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Prints and Posters
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 5: Others */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Others</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/games"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Games
            </Link>
          </li>
          <li>
            <Link
              href="/products/books"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Books
            </Link>
          </li>
          <li>
            <Link
              href="/products/notebooks"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Notebooks
            </Link>
          </li>
          <li>
            <Link
              href="/products/stickers"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Stickers
            </Link>
          </li>
          <li>
            <Link
              href="/products/tattoos"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Tattoos
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Mobile-expanded view for Resources
 */
const ResourcesDropdownMobileExpanded = ({ onLinkClick }: { onLinkClick: () => void }) => {
  return (
    <div className="mt-2 space-y-4">
      {/* Section 1: Resources */}
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Resources</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/faq"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              FAQ &amp; Help Center
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/etsy-store"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Etsy Store
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 2: Learn */}
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Learn</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/blog"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/prompt-library"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Prompt Library
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 3: Community */}
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Community</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/affiliate-program"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Affiliate Program
            </Link>
          </li>
          <li>
            <Link
              href="/refer-friend"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Refer a Friend Program
            </Link>
          </li>
          <li>
            <Link
              href="/etsy-store"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Etsy Store
            </Link>
          </li>
        </ul>
      </div>

      {/* Section 4: Get Support */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Get Support</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/legal"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Policies
            </Link>
          </li>
          <li>
            <Link
              href="/faq"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              FAQ &amp; Help Center
            </Link>
          </li>
          <li>
            <Link
              href="/track-order"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Track Order
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

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

  // New state for mobile accordion toggles:
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  // Refs for desktop hover timeouts:
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

  // Desktop hover handlers
  const handleProfileMouseEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 150);
  };

  const handleBasketMouseEnter = () => {
    if (basketTimeoutRef.current) clearTimeout(basketTimeoutRef.current);
    setBasketOpen(true);
  };

  const handleBasketMouseLeave = () => {
    basketTimeoutRef.current = setTimeout(() => {
      setBasketOpen(false);
    }, 150);
  };

  // Clean up desktop timeouts on unmount
  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      if (basketTimeoutRef.current) clearTimeout(basketTimeoutRef.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
      if (resourcesLeaveTimeout.current) clearTimeout(resourcesLeaveTimeout.current);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
    // Optionally close mobile accordions when closing the menu.
    if (mobileMenuOpen) {
      setMobileProductsOpen(false);
      setMobileResourcesOpen(false);
    }
  };

  const handleDropdownToggle = (index: number) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  // Desktop: Products dropdown hover handlers
  const handleDropdownEnter = () => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setProductsOpen(true);
  };

  const handleDropdownLeave = () => {
    leaveTimeout.current = window.setTimeout(() => {
      setProductsOpen(false);
    }, 200);
  };

  // Desktop: Resources dropdown hover handlers
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
      {/* HEADER (Desktop & Mobile visible) */}
      <header
        ref={headerRef}
        className="w-full border-b border-gray-200 bg-white relative z-40"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Image
                src={PromptlyLogo}
                alt="Promptly Logo"
                className="h-28 w-28"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden flex-1 items-center justify-center lg:flex lg:space-x-6">
            {navigationItems.map((navItem, index) => {
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

          {/* Desktop Icons */}
          <div className="hidden items-center space-x-4 lg:flex">
            <button className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md">
              <Search />
            </button>
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
                <button className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md">
                  <User />
                </button>
              </div>
            )}
            {isClient ? (
              <div className="relative">
                <button
                  onClick={() => setBasketOpen(!basketOpen)}
                  className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                >
                  <ShoppingCart />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button className="text-gray-700 transition-colors duration-200 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md">
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

      {/* MOBILE MENU: Full-screen overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden">
          {/* Mobile header with logo and close button */}
          <div className="px-4 pt-4 flex items-center justify-between">
            <Link href="/" onClick={toggleMobileMenu}>
              <Image src={PromptlyLogo} alt="Promptly Logo" className="h-16 w-16" />
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-gray-900 p-2 rounded-md"
            >
              <X />
            </button>
          </div>

          {/* Prominent mobile action icons row */}
          <div className="mt-4 px-4 flex justify-around items-center">
            <Link
              href="/search"
              onClick={toggleMobileMenu}
              className="flex flex-col items-center"
            >
              <Search className="h-8 w-8 text-gray-700" />
              <span className="mt-1 text-sm text-gray-700">Search</span>
            </Link>
            {isClient ? (
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  toggleMobileMenu();
                }}
                className="flex flex-col items-center"
              >
                <User className="h-8 w-8 text-gray-700" />
                <span className="mt-1 text-sm text-gray-700">Account</span>
              </button>
            ) : (
              <button className="flex flex-col items-center">
                <User className="h-8 w-8 text-gray-700" />
                <span className="mt-1 text-sm text-gray-700">Account</span>
              </button>
            )}
            {isClient ? (
              <button
                onClick={() => {
                  setBasketOpen(!basketOpen);
                  toggleMobileMenu();
                }}
                className="flex flex-col items-center"
              >
                <ShoppingCart className="h-8 w-8 text-gray-700" />
                <span className="mt-1 text-sm text-gray-700">Basket</span>
              </button>
            ) : (
              <button className="flex flex-col items-center">
                <ShoppingCart className="h-8 w-8 text-gray-700" />
                <span className="mt-1 text-sm text-gray-700">Basket</span>
              </button>
            )}
          </div>

          {/* Mobile navigation list */}
          <nav className="mt-6 px-4">
            <ul className="space-y-4">
              {navigationItems.map((item) => {
                if (item.isButton) {
                  return (
                    <li key={item.name}>
                      <Button
                        asChild
                        variant="default"
                        className={`w-full ${brandAccentColor}`}
                      >
                        <Link href={item.href} onClick={toggleMobileMenu}>
                          {item.name}
                        </Link>
                      </Button>
                    </li>
                  );
                }
                if (item.isProducts) {
                  return (
                    <li key={item.name}>
                      <button
                        className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setMobileProductsOpen((prev) => !prev)}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`transition-transform duration-200 ${
                            mobileProductsOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                      {mobileProductsOpen && (
                        <div className="mt-2 pl-4 border-l border-gray-200">
                          <ProductsDropdownMobileExpanded onLinkClick={toggleMobileMenu} />
                        </div>
                      )}
                    </li>
                  );
                }
                if (item.subItems) {
                  // We use this for Resources.
                  return (
                    <li key={item.name}>
                      <button
                        className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setMobileResourcesOpen((prev) => !prev)}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`transition-transform duration-200 ${
                            mobileResourcesOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                      {mobileResourcesOpen && (
                        <div className="mt-2 pl-4 border-l border-gray-200">
                          <ResourcesDropdownMobileExpanded onLinkClick={toggleMobileMenu} />
                        </div>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={toggleMobileMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Only render desktop dropdowns on the client */}
      {isClient && (
        <>
          {productsOpen && (
            <ProductsDropdown
              headerBottom={headerBottom}
              onDropdownEnter={handleDropdownEnter}
              onDropdownLeave={handleDropdownLeave}
            />
          )}
          {resourcesOpen && (
            <ResourcesDropdown
              headerBottom={headerBottom}
              onDropdownEnter={handleResourcesEnter}
              onDropdownLeave={handleResourcesLeave}
            />
          )}
          <ProfileDropdown
            headerBottom={headerBottom}
            onDropdownEnter={handleProfileMouseEnter}
            onDropdownLeave={handleProfileMouseLeave}
            isOpen={profileDropdownOpen}
            isSignedIn={isSignedIn}
            onSignOut={signOut}
          />
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