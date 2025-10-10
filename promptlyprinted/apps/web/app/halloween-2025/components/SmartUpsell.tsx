'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ShoppingBag, Sparkles, TrendingUp, Users } from 'lucide-react';

export const SmartUpsell = () => {
  const handleUpsellClick = (productType: string) => {
    // Award points for upsell interaction
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 30);
    }

    console.log('Upsell clicked:', productType);
    window.location.href = '/design/halloween';
  };

  const bundles = [
    {
      id: 1,
      title: "Complete Halloween Outfit",
      subtitle: "Most Popular - Save 25%",
      items: ["Custom Hoodie", "Matching T-Shirt", "Design Bundle"],
      originalPrice: "£79.97",
      bundlePrice: "£59.99",
      savings: "£19.98",
      badge: "BEST VALUE",
      icon: TrendingUp,
      popular: true,
    },
    {
      id: 2,
      title: "Squad Halloween Pack",
      subtitle: "Perfect for Groups",
      items: ["4x Custom T-Shirts", "Coordinated Designs", "Free Extras Pack"],
      originalPrice: "£99.96",
      bundlePrice: "£74.99",
      savings: "£24.97",
      badge: "GROUP DEAL",
      icon: Users,
      popular: false,
    },
    {
      id: 3,
      title: "Premium Design Package",
      subtitle: "Everything You Need",
      items: ["Hoodie + 2 T-Shirts", "AI Design Credits", "Priority Support"],
      originalPrice: "£119.97",
      bundlePrice: "£89.99",
      savings: "£29.98",
      badge: "PREMIUM",
      icon: Sparkles,
      popular: false,
    },
  ];

  const addOns = [
    {
      name: "Extra T-Shirt",
      description: "Add another tee to your order",
      price: "£14.99",
      discount: "Save £5",
    },
    {
      name: "Matching Accessories",
      description: "Halloween-themed extras",
      price: "£9.99",
      discount: "Bundle & Save",
    },
    {
      name: "Gift Wrapping",
      description: "Spooky premium packaging",
      price: "£4.99",
      discount: "First-time free",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#1a0b2e] to-[#16213e]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-orange-600/20 border border-orange-500/30 px-4 py-2 rounded-full mb-4">
            <span className="text-orange-400 font-bold">💰 SAVE MORE WITH BUNDLES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Complete Your <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">Halloween Look</span>
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Customers who bundle save an average of £24 and get everything they need in one order
          </p>
        </div>

        {/* Bundle Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative bg-gradient-to-br rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                bundle.popular
                  ? 'from-orange-900/40 to-purple-900/40 border-2 border-orange-500 shadow-2xl shadow-orange-500/20'
                  : 'from-purple-900/30 to-indigo-900/30 border border-purple-500/30'
              }`}
            >
              {/* Badge */}
              {bundle.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold px-6 py-2 rounded-full text-sm shadow-lg">
                    {bundle.badge}
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="flex items-center justify-center mb-6 mt-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  bundle.popular ? 'bg-orange-500/20' : 'bg-purple-500/20'
                }`}>
                  <bundle.icon className={`w-8 h-8 ${bundle.popular ? 'text-orange-400' : 'text-purple-400'}`} />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{bundle.title}</h3>
                <p className="text-purple-300 text-sm mb-4">{bundle.subtitle}</p>

                {/* Items */}
                <ul className="space-y-2 mb-6">
                  {bundle.items.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-center gap-2 text-purple-200">
                      <span className="text-green-400">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-gray-500 line-through text-lg">{bundle.originalPrice}</span>
                    <span className={`text-3xl font-bold ${bundle.popular ? 'text-orange-400' : 'text-white'}`}>
                      {bundle.bundlePrice}
                    </span>
                  </div>
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-2 inline-block">
                    <span className="text-green-400 font-semibold">Save {bundle.savings}</span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleUpsellClick(bundle.title)}
                  size="lg"
                  className={`w-full font-bold text-lg py-6 rounded-xl transition-all duration-300 ${
                    bundle.popular
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-xl'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Get This Bundle
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add-Ons */}
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Quick Add-Ons</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {addOns.map((addOn, idx) => (
              <div
                key={idx}
                className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300 cursor-pointer group"
                onClick={() => handleUpsellClick(addOn.name)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-bold mb-1">{addOn.name}</h4>
                    <p className="text-purple-300 text-sm">{addOn.description}</p>
                  </div>
                  <div className="text-orange-400 font-bold">{addOn.price}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm font-semibold">{addOn.discount}</span>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-orange-600 text-white text-sm group-hover:bg-orange-600 transition-all duration-300"
                  >
                    Add +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof for Bundles */}
        <div className="mt-12 text-center">
          <p className="text-purple-300">
            <span className="text-orange-400 font-bold">1,847</span> customers saved money with bundles this week
          </p>
        </div>
      </div>
    </section>
  );
};
