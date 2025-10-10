'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Wand2, Users, Zap, Ghost, Sparkles } from 'lucide-react';

export const FinalCTA = () => {
  const handleCTAClick = (type: 'main' | 'express' | 'group') => {
    // Award points based on CTA type
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      const points = type === 'express' ? 150 : type === 'group' ? 100 : 75;
      (window as any).addPhantomPoints('phantomPoints', points);
    }

    // Navigate to Halloween design funnel
    window.location.href = '/design/halloween';
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#1a0b2e] to-[#0a0a0a]">
      <div className="container mx-auto px-6">
        {/* Main CTA Section */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Create a{' '}
              <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
                Petrifying Print?
              </span>
            </h2>
            <p className="text-2xl text-purple-200 leading-relaxed">
              Join thousands of Halloween enthusiasts who've discovered the magic of AI-powered custom apparel.
              Your perfect Halloween look is just one click away.
            </p>
          </div>

          {/* Phantom Points Bonus */}
          <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Ghost className="w-6 h-6 text-purple-400" />
              <span className="text-white font-bold text-lg">Limited Time Bonus</span>
              <Ghost className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-purple-200">
              Start designing now and get{' '}
              <span className="text-orange-400 font-bold">500 bonus 👻 Phantom Points</span>
              {' '}(worth £5 in design credits)
            </p>
          </div>

          {/* Primary CTAs */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Main CTA */}
            <div className="md:col-span-3 lg:col-span-1">
              <Button
                onClick={() => handleCTAClick('main')}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-xl py-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <Wand2 className="w-6 h-6 mr-3" />
                Unleash Your Creativity
              </Button>
              <p className="text-purple-300 text-sm mt-3">
                Perfect for unique, custom designs
              </p>
            </div>

            {/* Express CTA */}
            <div>
              <Button
                onClick={() => handleCTAClick('express')}
                size="lg"
                variant="outline"
                className="w-full border-orange-500 text-orange-300 hover:bg-orange-900/30 font-bold text-lg py-8 rounded-2xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Halloween-Ready Fast
              </Button>
              <p className="text-purple-300 text-sm mt-3">
                48-hour express delivery available
              </p>
            </div>

            {/* Group CTA */}
            <div>
              <Button
                onClick={() => handleCTAClick('group')}
                size="lg"
                variant="outline"
                className="w-full border-purple-500 text-purple-300 hover:bg-purple-900/30 font-bold text-lg py-8 rounded-2xl"
              >
                <Users className="w-5 h-5 mr-2" />
                Design for Your Squad
              </Button>
              <p className="text-purple-300 text-sm mt-3">
                Group discounts & coordination tools
              </p>
            </div>
          </div>

          {/* Final Guarantees */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="text-white font-semibold mb-2">100% Satisfaction</h4>
              <p className="text-purple-300 text-sm">Love it or we'll make it right</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Halloween Delivery</h4>
              <p className="text-purple-300 text-sm">Guaranteed by October 31st</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Premium Quality</h4>
              <p className="text-purple-300 text-sm">Professional-grade materials</p>
            </div>
          </div>

          {/* Final Message */}
          <div className="border-t border-purple-500/20 pt-12">
            <div className="flex items-center justify-center gap-2 text-purple-200 text-lg mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Don't let your Halloween dreams remain just dreams</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-purple-300 max-w-2xl mx-auto leading-relaxed">
              Every Halloween is a chance to express your creativity and stand out from the crowd.
              With our AI-powered design platform, you're not just buying clothing—you're creating a statement,
              a memory, and a piece of wearable art that's uniquely yours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};