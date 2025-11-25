// Header.tsx
'use client';

import { useSession, signOut } from '@repo/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import { ChevronDown, Menu, Search, ShoppingCart, User, X, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BasketDropdown } from './BasketDropdown';
import { ProductsDropdown } from './ProductsDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import PromptlyLogo from './PromptlyLogo.svg';
import { ResourcesDropdown } from './ResourcesDropdown';
import { SearchOverlay } from './SearchOverlay';
import { useCountry } from '@/components/providers/CountryProvider';
import { SUPPORTED_COUNTRIES } from '@/utils/currency';

const navigationItems = [
  { name: 'Home', href: '/' },
  {
    name: 'Products',
    isProducts: true, // Special flag to identify the Products item
  },
  {
    name: 'Resources',
    // On desktop, ResourcesDropdown is used.
    // On mobile we use an accordion with detailed sub-items.
    subItems: [
      // These items will be replaced with a full mobile view below.
      { name: 'Resources', href: '#' },
    ],
  },
  { name: 'About Us', href: '/about' },
  {
    name: 'Design Your Apparel',
    href: '/design/mens-classic-t-shirt',
    isButton: true,
  },
];

const brandAccentColor = 'bg-teal-500 hover:bg-teal-600 text-white';

// Mobile-expanded view for Products
const ProductsDropdownMobileExpanded = ({
  onLinkClick,
}: {
  onLinkClick: () => void;
}) => {
  return (
    <div className="mt-2 space-y-4">
      {/* Section 1: Intro */}
      <div className="border-b pb-2">
        <h3 className="font-semibold text-gray-800 text-lg">
          Use your imagination
        </h3>
        <p className="mt-1 text-gray-600 text-sm">
          Discover unique products that spark creativity and imagination.
        </p>
        <Link
          href="/products/apparel/all"
          onClick={onLinkClick}
          className="mt-1 inline-flex items-center gap-2 font-medium text-gray-900 text-sm transition-colors duration-200 hover:text-gray-700"
        >
          Explore Products →
        </Link>
      </div>
      {/* Section 2: Apparel */}
      <div className="border-b pb-2">
        <h3 className="font-semibold text-gray-800 text-lg">Apparel</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/apparel/all"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              All
            </Link>
          </li>
          <li>
            <Link
              href="/products/apparel/mens"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Men
            </Link>
          </li>
          <li>
            <Link
              href="/products/apparel/womens"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Women
            </Link>
          </li>
          <li>
            <Link
              href="/products/apparel/kids+babies"
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
        <h3 className="font-semibold text-gray-800 text-lg">Accessories</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/accessories/mats-sleeves"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Mats &amp; Sleeves
            </Link>
          </li>
          <li>
            <Link
              href="/products/accessories/socks-flipflops"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Socks &amp; Flip-flops
            </Link>
          </li>
          <li>
            <Link
              href="/products/accessories/pendants-keyrings"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Pendants &amp; Keyrings
            </Link>
          </li>
          <li>
            <Link
              href="/products/accessories/bags"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Bags
            </Link>
          </li>
          <li>
            <Link
              href="/products/accessories/watch-straps"
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
        <h3 className="font-semibold text-gray-800 text-lg">
          Home &amp; Living
        </h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/home-living/cushions"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Cushions
            </Link>
          </li>
          <li>
            <Link
              href="/products/home-living/gallery-boards"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Gallery Boards
            </Link>
          </li>
          <li>
            <Link
              href="/products/home-living/acrylic-prisms"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Acrylic Prisms
            </Link>
          </li>
          <li>
            <Link
              href="/products/home-living/prints-posters"
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
        <h3 className="font-semibold text-gray-800 text-lg">Others</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <Link
              href="/products/others/games"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Games
            </Link>
          </li>
          <li>
            <Link
              href="/products/others/books"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Books
            </Link>
          </li>
          <li>
            <Link
              href="/products/others/notebooks"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Notebooks
            </Link>
          </li>
          <li>
            <Link
              href="/products/others/stickers"
              onClick={onLinkClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Stickers
            </Link>
          </li>
          <li>
            <Link
              href="/products/others/tattoos"
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

// Mobile-expanded view for Resources
const ResourcesDropdownMobileExpanded = ({
  onLinkClick,
}: {
  onLinkClick: () => void;
}) => {
  return (
    <div className="mt-2 space-y-4">
      {/* Section 1: Resources */}
      <div className="border-b pb-2">
        <h3 className="font-semibold text-gray-800 text-lg">Resources</h3>
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
        <h3 className="font-semibold text-gray-800 text-lg">Learn</h3>
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
        <h3 className="font-semibold text-gray-800 text-lg">Community</h3>
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
        <h3 className="font-semibold text-gray-800 text-lg">Get Support</h3>
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



const CountrySelector = ({ mobile = false }: { mobile?: boolean }) => {
  const { countryCode, setCountry } = useCountry();

  return (
    <div className={`relative flex items-center ${mobile ? 'w-full justify-between px-3 py-2 rounded-md hover:bg-gray-100 mb-2' : 'mr-2'}`}>
      {mobile && <span className="font-medium text-gray-700">Region</span>}
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4 text-gray-500" />
        <select
          value={countryCode}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer border-none py-1"
          aria-label="Select Country"
        >
          {SUPPORTED_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.code} ({country.currency})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const Header = () => {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  
  // Debug logging
  console.log('Header - Session data:', session);
  console.log('Header - Is signed in:', isSignedIn);
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(
    null
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Mobile accordion toggles:
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  // Refs for desktop hover timeouts:
  const basketTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const resourcesLeaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update headerBottom on scroll and resize
  useEffect(() => {
    const updateHeaderBottom = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderBottom(rect.bottom);
      }
    };

    updateHeaderBottom();
    window.addEventListener('scroll', updateHeaderBottom);
    window.addEventListener('resize', updateHeaderBottom);

    return () => {
      window.removeEventListener('scroll', updateHeaderBottom);
      window.removeEventListener('resize', updateHeaderBottom);
    };
  }, []);

  // Desktop hover handlers for basket
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
      if (basketTimeoutRef.current) clearTimeout(basketTimeoutRef.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
      if (resourcesLeaveTimeout.current)
        clearTimeout(resourcesLeaveTimeout.current);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
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
    leaveTimeout.current = setTimeout(() => {
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
    resourcesLeaveTimeout.current = setTimeout(() => {
      setResourcesOpen(false);
    }, 200);
  };

  return (
    <>
      {/* HEADER (Desktop & Mobile) */}
      <header
        ref={headerRef}
        className="relative sticky top-0 z-40 w-full border-gray-200 border-b bg-white"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Image
                src={PromptlyLogo}
                alt="Promptly Logo"
                width={128}
                height={128}
                className="h-32 w-32"
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
                      className="flex items-center space-x-1 rounded-md p-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <span>{navItem.name}</span>
                    </button>
                  </div>
                );
              }
              if (navItem.name === 'Resources') {
                return (
                  <div key={navItem.name} className="relative">
                    <button
                      onMouseEnter={handleResourcesEnter}
                      onMouseLeave={handleResourcesLeave}
                      onClick={() => setResourcesOpen((prev) => !prev)}
                      className="flex items-center space-x-1 rounded-md p-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
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
                      className="flex items-center space-x-1 rounded-md p-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <span>{navItem.name}</span>
                    </button>
                    {dropdownOpenIndex === index && (
                      <div
                        onMouseEnter={() => setDropdownOpenIndex(index)}
                        onMouseLeave={() => setDropdownOpenIndex(null)}
                        className="absolute top-10 left-0 z-50 w-64 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5"
                      >
                        {navItem.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href ?? '#'}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-600 text-sm transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
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
                    <Link href={navItem.href ?? '/'}>{navItem.name}</Link>
                  </Button>
                );
              }
              return (
                <Link
                  key={navItem.name}
                  href={navItem.href ?? '/'}
                  className="rounded-md px-3 py-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                >
                  {navItem.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden items-center space-x-4 lg:flex">
            <CountrySelector />
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
            >
              <Search />
            </button>
            {isClient ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                >
                  <User />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button className="rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900">
                  <User />
                </button>
              </div>
            )}
            {isClient ? (
              <div className="relative">
                <button
                  onClick={() => setBasketOpen(!basketOpen)}
                  className="rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                >
                  <ShoppingCart />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button className="rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900">
                  <ShoppingCart />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex items-center rounded-md p-2 text-gray-700 hover:text-gray-900 lg:hidden"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU: Full-screen overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <Link href="/" onClick={toggleMobileMenu}>
              <Image
                src={PromptlyLogo}
                alt="Promptly Logo"
                className="h-16 w-16"
              />
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 text-gray-700 hover:text-gray-900"
            >
              <X />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-around px-4">
            <button
              onClick={() => {
                setSearchOpen(true);
                toggleMobileMenu();
              }}
              className="flex flex-col items-center"
            >
              <Search className="h-8 w-8 text-gray-700" />
              <span className="mt-1 text-gray-700 text-sm">Search</span>
            </button>
            {isClient ? (
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  toggleMobileMenu();
                }}
                className="flex flex-col items-center"
              >
                <User className="h-8 w-8 text-gray-700" />
                <span className="mt-1 text-gray-700 text-sm">Account</span>
              </button>
            ) : (
              <button className="flex flex-col items-center">
                <User className="h-8 w-8 text-gray-700" />
                <span className="mt-1 text-gray-700 text-sm">Account</span>
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
                <span className="mt-1 text-gray-700 text-sm">Basket</span>
              </button>
            ) : (
              <button className="flex flex-col items-center">
                <ShoppingCart className="h-8 w-8 text-gray-700" />
                <span className="mt-1 text-gray-700 text-sm">Basket</span>
              </button>
            )}

          </div>
          <nav className="mt-6 px-4">
            <CountrySelector mobile />
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
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-base text-gray-700 hover:bg-gray-100"
                        onClick={() => setMobileProductsOpen((prev) => !prev)}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`transition-transform duration-200 ${
                            mobileProductsOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>
                      {mobileProductsOpen && (
                        <div className="mt-2 border-gray-200 border-l pl-4">
                          <ProductsDropdownMobileExpanded
                            onLinkClick={toggleMobileMenu}
                          />
                        </div>
                      )}
                    </li>
                  );
                }
                if (item.subItems) {
                  return (
                    <li key={item.name}>
                      <button
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-base text-gray-700 hover:bg-gray-100"
                        onClick={() => setMobileResourcesOpen((prev) => !prev)}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`transition-transform duration-200 ${
                            mobileResourcesOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>
                      {mobileResourcesOpen && (
                        <div className="mt-2 border-gray-200 border-l pl-4">
                          <ResourcesDropdownMobileExpanded
                            onLinkClick={toggleMobileMenu}
                          />
                        </div>
                      )}
                    </li>
                  );
                }
                if (!item.href) return null;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block rounded-md px-3 py-2 font-medium text-base text-gray-700 hover:bg-gray-100"
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

      {/* Desktop Dropdowns */}
      {isClient && (
        <>
          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
          />
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
            isOpen={profileDropdownOpen}
            isSignedIn={isSignedIn}
            onSignOut={handleSignOut}
            onClose={() => setProfileDropdownOpen(false)}
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
