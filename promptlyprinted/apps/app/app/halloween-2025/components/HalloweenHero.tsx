'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, Wand2, Ghost } from 'lucide-react';

export const HalloweenHero = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCTAClick = () => {
    // Award points for engagement
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 50);
    }

    // TODO: Navigate to design funnel
    console.log('Navigate to Halloween design funnel');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 animate-pulse">
          <Ghost className="w-8 h-8 text-purple-300/30" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-1000">
          <Sparkles className="w-6 h-6 text-orange-300/40" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-2000">
          <Wand2 className="w-10 h-10 text-violet-300/20" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Create Your{' '}
          <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
            Hauntingly Unique
          </span>
          <br />
          Halloween Look
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-purple-200 mb-8 max-w-4xl mx-auto leading-relaxed">
          Transform your Halloween vision into reality with our{' '}
          <span className="text-orange-300 font-semibold">AI-powered design platform</span>.
          From wickedly wonderful hoodies to perfectly petrifying tees, create one-of-a-kind pieces
          that guarantee you'll be the talk of every Halloween gathering.
        </p>

        {/* Key Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm md:text-base">
          <div className="flex items-center gap-2 text-purple-200">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>AI Magic in Seconds</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <Ghost className="w-5 h-5 text-purple-400" />
            <span>Premium Quality Materials</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <Wand2 className="w-5 h-5 text-orange-400" />
            <span>Express Halloween Delivery</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCTAClick}
          >
            <Wand2 className={`w-5 h-5 mr-2 ${isHovered ? 'animate-spin' : ''}`} />
            Start My AI Design Journey
          </Button>

          {/* Secondary CTA */}
          <div className="text-purple-300 text-sm">
            <span className="opacity-75">Or</span>{' '}
            <button className="underline hover:text-orange-300 transition-colors">
              Browse Halloween Templates
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-purple-300 text-sm opacity-75">
          <div>🎃 2,500+ Happy Halloween Customers</div>
          <div>⚡ 48-Hour Express Delivery</div>
          <div>🌱 Eco-Friendly Materials</div>
          <div>🔒 Secure & Trusted</div>
        </div>
      </div>

      {/* Floating Elements Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-float">
          <div className="w-3 h-3 bg-orange-400 rounded-full opacity-20"></div>
        </div>
        <div className="absolute top-3/4 right-1/4 animate-float delay-1000">
          <div className="w-2 h-2 bg-purple-400 rounded-full opacity-30"></div>
        </div>
        <div className="absolute top-1/2 left-3/4 animate-float delay-2000">
          <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-15"></div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};