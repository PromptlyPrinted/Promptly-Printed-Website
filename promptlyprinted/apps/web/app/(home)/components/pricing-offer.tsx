'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, Check, Clock } from 'lucide-react';
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
    'Unlimited AI design generations',
    'Premium organic cotton up to 280gsm',
    'Professional DTG printing',
    'Free worldwide shipping',
    'Satisfaction guarantee',
    'One-of-one exclusivity',
  ];

  return (
    <div className="w-full bg-gradient-to-br from-[#0D2C45] via-[#16C1A8] to-[#0D2C45] py-20 lg:py-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF8A26] text-white font-semibold text-sm">
              <Clock className="w-4 h-4" />
              Limited Time Offer
            </div>
            <h2 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Your first AI Tee — Special Launch Price
            </h2>
            <p className="max-w-2xl text-lg text-white/80 leading-relaxed">
              Join our community of creators and get exclusive launch pricing.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="w-full max-w-2xl">
            <div className="relative p-8 lg:p-12 rounded-3xl bg-white shadow-2xl border-4 border-[#FF8A26]">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-6 py-2 rounded-full bg-[#FF8A26] text-white font-bold text-sm">
                  LIMITED DROP
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 pt-4">
                {/* Price */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-bold text-[#1E293B]">$39</span>
                    <span className="text-3xl text-[#64748B] line-through mb-2">$66</span>
                  </div>
                  <p className="text-[#64748B] text-lg">
                    Save <span className="font-bold text-[#16C1A8]">$27</span> on your first design
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
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-[#0D2C45] text-white font-bold text-2xl">
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">{unit.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#16C1A8] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-[#1E293B] text-sm">{feature}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  className="w-full gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-[#16C1A8]/25"
                  asChild
                >
                  <Link href="/designs">
                    Join the Drop <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>

                <p className="text-xs text-[#64748B] text-center">
                  Offer ends soon. Regular price $66 applies after.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
