'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, Check, Trophy, Zap } from 'lucide-react';
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
    'Personalized AI designs',
    'Premium organic cotton up to 280gsm',
    'Professional DTG printing',
    'Earn points for likes & photos',
    'Satisfaction guarantee',
    'Enter to win $500 USD cash prize',
  ];

  return (
    <div className="w-full bg-gradient-to-br from-red-950 via-green-900 to-black py-20 lg:py-32 relative overflow-hidden">
      {/* Floating Christmas Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl animate-pulse">🎄</div>
        <div className="absolute top-40 right-20 text-7xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎁</div>
        <div className="absolute bottom-40 left-20 text-6xl animate-pulse" style={{ animationDelay: '1s' }}>❄️</div>
        <div className="absolute bottom-20 right-40 text-8xl animate-bounce" style={{ animationDelay: '1.5s' }}>⭐</div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 via-green-600 to-red-600 text-white font-semibold text-sm shadow-lg shadow-red-500/50 animate-pulse">
              <Zap className="w-4 h-4" />
              Christmas 2025 Special
            </div>
            <h2 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-400 via-green-400 to-red-400 bg-clip-text text-transparent tracking-tight">
              Christmas Style Quiz — Win $500 USD Cash
            </h2>
            <p className="max-w-2xl text-lg text-gray-300 leading-relaxed">
              Take our Christmas quiz to discover your perfect festive design and enter to win $500 USD cash! Competition ends December 31st.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="w-full max-w-2xl">
            <div className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-gray-900 to-black shadow-2xl border-4 border-red-500">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 via-green-600 to-red-600 text-white font-bold text-sm shadow-lg">
                  🎄 CHRISTMAS SPECIAL
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 pt-4">
                {/* Price */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-bold bg-gradient-to-r from-red-400 to-green-400 bg-clip-text text-transparent">Win $500 USD</span>
                  </div>
                  <p className="text-gray-300 text-lg">
                    Earn points through <span className="font-bold text-red-400">likes, photos & social follows</span>
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
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-green-600 text-white font-bold text-2xl shadow-lg">
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
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-green-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-gray-200 text-sm">{feature}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-red-500 via-green-600 to-red-600 hover:from-red-600 hover:via-green-700 hover:to-red-700 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-red-500/30 group"
                  asChild
                >
                  <Link href="/christmas-2025/quiz?campaign=christmas-2025">
                    <Trophy className="h-5 w-5 group-hover:animate-bounce" />
                    Take the Christmas Quiz
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Takes 2 minutes • Enter to win $500 USD • Competition ends Dec 31st 🎄
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
