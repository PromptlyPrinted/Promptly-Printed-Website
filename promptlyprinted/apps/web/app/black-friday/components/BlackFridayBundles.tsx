'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import { Package, Gift, Sparkles, Check, Trophy, Zap } from 'lucide-react';

const bundles = [
  {
    id: 'design-stickers',
    name: 'Design + Stickers Bundle',
    description: 'Create your custom t-shirt design and get free stickers',
    discount: 35,
    features: [
      'Design your own custom t-shirt',
      'AI-powered design tools included',
      'FREE 3x4" sticker sheet (worth £8)',
      'Premium DTG printing',
      '48-hour priority dispatch',
      '$200 prize entry (on purchase)',
    ],
    image: '/lora-images/replicate-flux.png',
    color: 'from-yellow-500 to-orange-600',
    icon: Package,
    cta: 'Design Your Tee + Get Stickers',
    link: '/black-friday/quiz?bundle=design-stickers&discount=35',
  },
  {
    id: 'mega-discount',
    name: 'Mega Black Friday Deal',
    description: 'Maximum savings on your custom design',
    discount: 40,
    features: [
      'Design your own custom apparel',
      '40% OFF your entire order',
      'Access to all AI design models',
      'Unlimited design revisions',
      'Express production available',
      '$200 prize entry (on purchase)',
    ],
    image: '/lora-images/replicate-flux.png',
    color: 'from-red-500 to-pink-600',
    icon: Trophy,
    badge: 'Best Value',
    cta: 'Get 40% Off Now',
    link: '/black-friday/quiz?bundle=mega-discount&discount=40',
  },
];

export const BlackFridayBundles = () => {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1419] to-[#06070a]" id="bundles">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 text-sm mb-4">
            <Zap className="w-4 h-4" />
            Limited Time Black Friday Offers
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Black Friday Deal
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            Select the perfect bundle for you. All deals include AI-powered design tools and premium quality printing.
          </p>
        </div>

        {/* Bundles Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/30 hover:scale-[1.02] ${
                selectedBundle === bundle.id ? 'ring-2 ring-yellow-500' : ''
              }`}
              onMouseEnter={() => setSelectedBundle(bundle.id)}
              onMouseLeave={() => setSelectedBundle(null)}
            >
              {/* Badge */}
              {bundle.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold text-sm shadow-lg">
                    {bundle.badge}
                  </div>
                </div>
              )}

              {/* Gradient Background */}
              <div className={`absolute -inset-6 bg-gradient-to-br ${bundle.color} opacity-10 blur-3xl`} />

              {/* Content */}
              <div className="relative p-8">
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${bundle.color}`}>
                    <bundle.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{bundle.name}</h3>
                    <p className="text-gray-300 text-sm">{bundle.description}</p>
                  </div>
                </div>

                {/* Discount Badge */}
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${bundle.color} text-white font-bold text-3xl`}>
                    {bundle.discount}% OFF
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {bundle.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`mt-1 p-1 rounded-full bg-gradient-to-br ${bundle.color}`}>
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href={bundle.link}>
                  <Button
                    size="lg"
                    className={`w-full bg-gradient-to-r ${bundle.color} hover:opacity-90 text-white font-semibold py-6 rounded-2xl shadow-xl text-lg`}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {bundle.cta}
                  </Button>
                </Link>

                {/* Trust Badge */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-400" />
                      No hidden fees
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-400" />
                      Ends Nov 29th
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-400" />
                      UK shipping
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            All bundles include unlimited AI design generations and premium quality printing.
            <br />
            <span className="text-yellow-400 font-semibold">Competition entry for $200 cash prize included with purchase.</span> Entry only valid after completing your order.
          </p>
        </div>

        {/* Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Bundle Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium pb-4">Feature</th>
                    <th className="text-center text-yellow-300 font-bold pb-4">Design + Stickers<br />(35% OFF)</th>
                    <th className="text-center text-red-300 font-bold pb-4">Mega Deal<br />(40% OFF)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/10">
                    <td className="py-4">Discount</td>
                    <td className="text-center py-4 text-yellow-300 font-bold">35%</td>
                    <td className="text-center py-4 text-red-300 font-bold">40%</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-4">Free Stickers</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4"><span className="text-gray-500">—</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-4">AI Design Tools</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-4">Premium Printing</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-4">Express Production</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4">$200 Competition Entry*</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-gray-400 text-center">
              * Competition entry only valid after purchase is complete. You must buy a t-shirt to be eligible for the $200 prize.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
