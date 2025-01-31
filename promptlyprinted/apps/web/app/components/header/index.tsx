"use client";

import { useState } from "react";
import { useAuth } from "@repo/auth/client";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Menu,
  X,
  User,
  Search,
  ShoppingCart,
  ChevronDown,
  Menu as MenuIcon,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PromptlyLogo from "./PromptlyLogo.svg";
import { ProductsDropdown } from "./ProductsDropdown";

// Main navigation items (aside from "Products")
const navigationItems = [
  { name: "Home", href: "/" },
  {
    name: "Resources",
    icon: MenuIcon,
    subItems: [
      { name: "Blog", href: "/blog", icon: MenuIcon },
      { name: "Size & Fit", href: "/size-fit", icon: MenuIcon },
      { name: "FAQs", href: "/faqs", icon: MenuIcon },
      { name: "Affiliate Program", href: "/affiliate", icon: MenuIcon },
    ],
  },
  {
    name: "About",
    icon: MenuIcon,
    subItems: [
      { name: "About Us / Company", href: "/about", icon: MenuIcon },
    ],
  },
  {
    name: "Design Your Apparel",
    href: "/design",
    isButton: true,
  },
];

// Profile dropdown items
const profileItems = [
  { name: "Profile", href: "/profile" },
  { name: "My Images", href: "/my-images" },
  { name: "My Designs", href: "/my-designs" },
  { name: "Orders", href: "/orders" },
];

// You can tweak this color to match your brand's accent color
const brandAccentColor = "bg-teal-500 hover:bg-teal-600 text-white";

export const Header = () => {
  const { isSignedIn, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(
    null
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleDropdownToggle = (index: number) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  return (
    <>
      <header className="w-full border-b border-gray-100 bg-white">
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
            <ProductsDropdown />

            {/* Other Nav Items */}
            {navigationItems.map((navItem, index) => {
              // If it has subItems, handle as a dropdown
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
                            <MenuIcon className="h-4 w-4 text-gray-400" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              // If it's a button, render Button component
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
              // Else just a single link
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

      {/* Mobile Menu (dropdown) */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          {/* Products collapsible */}
          <div className="border-t border-gray-200 px-4 py-2">
            <button
              onClick={() => setDropdownOpenIndex(dropdownOpenIndex === 0 ? null : 0)}
              className="flex w-full items-center justify-between py-2 text-gray-700 hover:text-gray-900"
            >
              <span className="font-semibold">Products</span>
              <ChevronDown
                className={`transform transition-transform ${
                  dropdownOpenIndex === 0 ? "rotate-180" : ""
                }`}
              />
            </button>
            {dropdownOpenIndex === 0 && (
              <div className="mt-2 space-y-4">
                {/* Mobile Products Menu */}
                <div>
                  <h4 className="font-medium text-gray-800">Apparel</h4>
                  <ul className="ml-4 mt-2 space-y-2">
                    <li><Link href="/products/all" className="text-gray-600">All</Link></li>
                    <li><Link href="/products/mens" className="text-gray-600">Men</Link></li>
                    <li><Link href="/products/womens" className="text-gray-600">Women</Link></li>
                    <li><Link href="/products/kids+babies" className="text-gray-600">Kids & Babies</Link></li>
                  </ul>
                </div>
                {/* Add other product categories here */}
              </div>
            )}
          </div>

          {/* Other Nav Items */}
          {navigationItems.map((navItem, index) => {
            if (!navItem.isButton) {
              return (
                <div
                  key={navItem.name}
                  className="border-t border-gray-200 px-4 py-2"
                >
                  {navItem.subItems ? (
                    <>
                      <button
                        onClick={() => handleDropdownToggle(index + 1)}
                        className="flex w-full items-center justify-between py-2 text-gray-700 hover:text-gray-900"
                      >
                        <span className="font-semibold">{navItem.name}</span>
                        <ChevronDown
                          className={`transform transition-transform ${
                            dropdownOpenIndex === index + 1 ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {dropdownOpenIndex === index + 1 && (
                        <div className="mt-2 space-y-2">
                          {navItem.subItems.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="block pl-4 py-2 text-gray-600 hover:text-gray-900"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={navItem.href || "#"}
                      className="block py-2 font-semibold text-gray-700 hover:text-gray-900"
                    >
                      {navItem.name}
                    </Link>
                  )}
                </div>
              );
            }
            return null;
          })}

          {/* Design Your Apparel Button */}
          <div className="border-t border-gray-200 p-4">
            <Button asChild variant="default" className={`${brandAccentColor} w-full`}>
              <Link href="/design">Design Your Apparel</Link>
            </Button>
          </div>

          {/* Mobile menu bottom row icons */}
          <div className="border-t border-gray-200 px-4 py-3 flex items-center space-x-4">
            <button className="text-gray-700 hover:text-gray-900">
              <Search />
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              <User />
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              <ShoppingCart />
            </button>
          </div>
        </div>
      )}
    </>
  );
}