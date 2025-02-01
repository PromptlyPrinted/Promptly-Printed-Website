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
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PromptlyLogo from "./PromptlyLogo.svg";
import { ProductsDropdown } from "./ProductsDropdown";

const navigationItems = [
  { name: "Home", href: "/" },
  {
    name: "Resources",
    subItems: [
      { name: "Blog", href: "/blog" },
      { name: "Size & Fit", href: "/size-fit" },
      { name: "FAQs", href: "/faqs" },
      { name: "Affiliate Program", href: "/affiliate" },
    ],
  },
  {
    name: "About",
    subItems: [{ name: "About Us / Company", href: "/about" }],
  },
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
  // State to control whether the mega menu is open
  const [productsOpen, setProductsOpen] = useState(false);
  // State to store the header bottom position (in px)
  const [headerBottom, setHeaderBottom] = useState(0);

  // Create a ref for the header container
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      // Add the current scroll offset in case the page is scrolled
      setHeaderBottom(rect.bottom + window.scrollY);
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleDropdownToggle = (index: number) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  // Handlers for the mega menu so that hovering over it keeps it open
  const handleDropdownEnter = () => {
    setProductsOpen(true);
  };
  const handleDropdownLeave = () => {
    setProductsOpen(false);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="w-full border-b border-gray-100 bg-white relative z-40"
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
            {/* "Products" button triggers the mega menu */}
            <div className="relative">
              <button
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
                onClick={() => setProductsOpen((prev) => !prev)}
                className="flex items-center space-x-1 font-medium text-gray-700 hover:text-gray-900"
              >
                <span>Products</span>
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Other navigation items */}
            {navigationItems.map((navItem, index) => {
              if (navItem.subItems) {
                return (
                  <div key={navItem.name} className="relative">
                    <button
                      onMouseEnter={() => handleDropdownToggle(index)}
                      onMouseLeave={() => handleDropdownToggle(index)}
                      onClick={() => handleDropdownToggle(index)}
                      className="flex items-center space-x-1 font-medium text-gray-700 hover:text-gray-900"
                    >
                      <span>{navItem.name}</span>
                      <ChevronDown size={16} />
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
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                  className="font-medium text-gray-700 hover:text-gray-900"
                >
                  {navItem.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Icons/Buttons */}
          <div className="hidden items-center space-x-4 lg:flex">
            <button className="text-gray-700 hover:text-gray-900">
              <Search />
            </button>

            {/* Profile Icon with Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="text-gray-700 hover:text-gray-900"
              >
                <User />
              </button>
              {profileDropdownOpen && (
                <div
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 top-10 z-50 w-48 rounded-md bg-white p-2 shadow-xl"
                >
                  {profileItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  ))}
                  {isSignedIn ? (
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
            <button className="text-gray-700 hover:text-gray-900">
              <ShoppingCart />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex items-center text-gray-700 hover:text-gray-900 lg:hidden"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* (Mobile menu code omitted for brevity) */}

      {/* Render the mega menu using a portal when productsOpen is true.
          We pass the headerBottom value and enter/leave handlers */}
      {productsOpen && (
        <ProductsDropdown
          headerBottom={headerBottom}
          onDropdownEnter={handleDropdownEnter}
          onDropdownLeave={handleDropdownLeave}
        />
      )}
    </>
  );
};