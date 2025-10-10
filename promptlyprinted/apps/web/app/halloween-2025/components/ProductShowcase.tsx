'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Ghost, Heart, Sparkles, Zap, Users, Clock } from 'lucide-react';

interface HalloweenProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  currency: string;
  image: string;
  images?: string[];
  phantomPoints: number;
  isExpress: boolean;
  tags: string[];
  productType: string;
  brand: string;
  colors: string[];
  sizes: string[];
  stock: number;
  sku: string;
}

export const ProductShowcase = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [products, setProducts] = useState<HalloweenProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Halloween products from API
  useEffect(() => {
    const fetchHalloweenProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/halloween-products?category=${activeFilter}&limit=12`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setError(null);
        } else {
          setError(data.error || 'Failed to load products');
        }
      } catch (err) {
        setError('Network error loading products');
        console.error('Error fetching Halloween products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHalloweenProducts();
  }, [activeFilter]);

  const filters = [
    { id: 'all', label: 'All Designs', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'spooky', label: 'Spooky', icon: <Ghost className="w-4 h-4" /> },
    { id: 'cute', label: 'Cute Halloween', icon: <Heart className="w-4 h-4" /> },
    { id: 'pop-culture', label: 'Pop Culture', icon: <Zap className="w-4 h-4" /> },
    { id: 'group', label: 'Group Costumes', icon: <Users className="w-4 h-4" /> },
  ];

  const filteredProducts = products;

  const handleAddToDesign = (productId: number) => {
    // Award points for design interaction
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 25);
    }

    // Navigate to Halloween design tool
    window.location.href = '/design/halloween';
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#16213e] to-[#0f1419]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
              Halloween Design Gallery
            </span>
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Get inspired by our curated collection or start from scratch with AI magic
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg'
                  : 'bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 border border-purple-500/30'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-purple-800/30"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-purple-800/30 rounded"></div>
                  <div className="h-4 bg-purple-800/30 rounded w-3/4"></div>
                  <div className="h-8 bg-purple-800/30 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Oops! Something went wrong</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Ghost className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                <p className="text-purple-200">Try selecting a different category or check back later!</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-gradient-to-b from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Express Badge */}
                {product.isExpress && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Express
                  </div>
                )}

                {/* Phantom Points Badge */}
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Ghost className="w-3 h-3" />
                  {product.phantomPoints}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                  {product.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-800/50 text-purple-200 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-orange-400">
                    {product.currency === 'GBP' ? '£' : product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : ''}{product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-purple-300 line-through text-lg">
                      {product.currency === 'GBP' ? '£' : product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : ''}{product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice > product.price && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      SAVE {product.currency === 'GBP' ? '£' : product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : ''}{(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => handleAddToDesign(product.id)}
                    className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Customize This Design
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-200 hover:bg-purple-800/30"
                  >
                    Quick Preview
                  </Button>
                </div>

                {/* Phantom Points Earn */}
                <div className="mt-4 text-center text-purple-300 text-sm">
                  Earn {product.phantomPoints} 👻 Phantom Points
                </div>
              </div>
            </div>
              ))
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Don't See Your Perfect Design?
            </h3>
            <p className="text-purple-200 mb-6">
              Let our AI create something completely unique just for you
            </p>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Custom AI Design
          </Button>
        </div>
      </div>
    </section>
  );
};