'use client';

import Image from 'next/image';
import { Button } from '@repo/design-system/components/ui/button';
import { Package, Ticket, Gift, Truck, Shield } from 'lucide-react';

export const ProductBundlePreview = () => {
  const bundleFeatures = [
    { icon: Package, title: 'Premium Apparel', description: 'Choose from hoodie, tee, or crewneck with organic cotton up to 280gsm.' },
    { icon: Ticket, title: '10% Creator Discount', description: 'Automatically applied when you check out within 48 hours.' },
    { icon: Gift, title: 'Free Sticker Pack', description: 'Limited edition die-cut stickers with every bundle purchase.' },
    { icon: Truck, title: '48-Hour Dispatch', description: 'Priority Halloween shipping from UK & EU fulfilment hubs.' },
  ];

  const guaranteeItems = [
    { icon: '🎨', text: 'AI-assisted design guidance included' },
    { icon: '✨', text: 'Unlimited revisions pre-production' },
    { icon: '🛡️', text: 'Quality guarantee or we reprint at no cost' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1419] to-[#06070a]" id="bundle-offer">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-200 text-sm mb-4">
            Only 200 creator bundles left this week
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Turn Your Design Into a Sell-Out Drop
          </h2>
          <p className="text-purple-200 max-w-3xl mx-auto">
            Lock in the creator bundle and we&apos;ll handle printing, fulfilment, and packaging—so you focus on the
            creative and your community.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-10 items-center max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-orange-500/20 via-purple-500/10 to-transparent rounded-[40px] blur-3xl" />
            <div className="relative bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-square">
                  <Image
                    src="/lora-images/replicate-flux.png"
                    alt="Halloween bundled products"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-[#1a0b2e] to-[#0f1419]">
                  <div>
                    <div className="flex items-center gap-2 text-orange-300 font-semibold uppercase tracking-wide text-xs mb-2">
                      Bundle includes
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Creator Drop Kit</h3>
                    <ul className="space-y-3 text-purple-200 text-sm">
                      <li>• Premium apparel piece with your AI design</li>
                      <li>• Digital &amp; printed prompt card</li>
                      <li>• Sticker pack (worth £12) included free</li>
                      <li>• Priority printing slot before Halloween</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <div className="text-sm text-purple-300">Bundle price</div>
                    <div className="text-3xl font-bold text-white">£59.00</div>
                    <div className="text-xs text-purple-400 mt-1">Save £18 vs. buying separately</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {bundleFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="flex gap-4 bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-orange-400/60 transition"
              >
                <div className="mt-1">
                  <feature.icon className="w-6 h-6 text-orange-300" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{feature.title}</h4>
                  <p className="text-purple-200 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-6 rounded-2xl shadow-xl"
              onClick={() => window.open('/checkout?bundle=halloween-creator', '_self')}
            >
              Reserve my creator bundle
            </Button>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-3xl p-6 text-sm text-purple-100 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Shield className="w-4 h-4 text-green-300" />
                Included guarantees
              </div>
              <ul className="space-y-2">
                {guaranteeItems.map((item) => (
                  <li key={item.text} className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-purple-300">
                Designing for a group or brand? Talk to our team for bulk pricing and white-label options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
