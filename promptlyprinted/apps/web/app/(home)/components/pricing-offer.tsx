'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, Check, Ghost, Skull } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const PricingOffer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    'Personalized AI Halloween designs',
    'Premium organic cotton up to 280gsm',
    'Professional DTG printing',
    'Exclusive quiz discounts & freebies',
    'Satisfaction guarantee',
    'Limited edition Halloween items',
  ];

  return (
    <div className="w-full bg-gradient-to-br from-orange-950 via-purple-900 to-black py-20 lg:py-32 relative overflow-hidden">
      {/* Floating Halloween Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl animate-pulse">🎃</div>
        <div className="absolute top-40 right-20 text-7xl animate-bounce" style={{ animationDelay: '0.5s' }}>👻</div>
        <div className="absolute bottom-40 left-20 text-6xl animate-pulse" style={{ animationDelay: '1s' }}>🦇</div>
        <div className="absolute bottom-20 right-40 text-8xl animate-bounce" style={{ animationDelay: '1.5s' }}>💀</div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/50 animate-pulse">
              <Skull className="w-4 h-4" />
              Halloween 2025 Special
            </div>
            <h2 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              Spooky Style Quiz — Unlock Exclusive Discounts
            </h2>
            <p className="max-w-2xl text-lg text-gray-300 leading-relaxed">
              Take our Halloween quiz to discover your perfect design and unlock up to 50% off + free spooky goodies!
            </p>
          </div>

          {/* Pricing Card */}
          <div className="w-full max-w-2xl">
            <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-gray-900 to-black shadow-2xl border-4 border-orange-500">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-sm shadow-lg">
                  🎃 LIMITED HALLOWEEN DROP
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 pt-4">
                {/* Price */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">Up to 50% OFF</span>
                  </div>
                  <p className="text-gray-300 text-lg">
                    Plus <span className="font-bold text-orange-400">FREE Halloween freebies</span> with your order
                  </p>
                </div>

                {/* Countdown */}
                <div className="flex gap-4">
                  {[
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                    { label: 'Seconds', value: timeLeft.seconds },
                  ].map((unit, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-purple-600 text-white font-bold text-2xl shadow-lg">
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{unit.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-gray-200 text-sm">{feature}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-orange-500/30 group"
                  asChild
                >
                  <Link href="/halloween-2025/quiz?campaign=halloween-2025">
                    <Ghost className="h-5 w-5 group-hover:animate-bounce" />
                    Take the Halloween Quiz
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Takes 2 minutes • Instant discounts • Free Halloween goodies included 🎃
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
