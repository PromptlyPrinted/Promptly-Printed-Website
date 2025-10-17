'use client';

import { useEffect, useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Timer, Flame, Gift, Zap } from 'lucide-react';

const OFFER_END_HOURS = 48;

const calculateTimeLeft = () => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + OFFER_END_HOURS);
  return expiry.getTime();
};

const formatRemaining = (target: number) => {
  const now = Date.now();
  const diff = Math.max(target - now, 0);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const LimitedTimeOffer = () => {
  const [deadline] = useState(calculateTimeLeft);
  const [remaining, setRemaining] = useState(formatRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(formatRemaining(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <section className="py-16 bg-gradient-to-r from-[#2b0f2f] via-[#1a0b2e] to-[#0f1419] border-y border-purple-500/20">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto bg-[#0d1324]/90 border border-orange-500/30 rounded-3xl p-8 md:p-10 shadow-[0_0_40px_rgba(255,138,38,0.25)]">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-200 text-sm mb-4">
                <Flame className="w-4 h-4" />
                Creator bundle expires soon
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Claim 10% Off + Free Sticker Pack When You Order Today
              </h3>
              <p className="text-purple-200 max-w-2xl">
                This week only: complete the guided flow, place your order, and we&apos;ll include a free sticker pack
                plus priority printing. Spots are limited so we can maintain production quality.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-300" />
                  Bonus: Halloween sticker pack + digital poster (£18 value)
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-300" />
                  First 50 orders today receive express shipping upgrades
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-6 text-center min-w-[240px]">
              <div className="flex items-center justify-center gap-2 text-orange-300 font-semibold text-sm">
                <Timer className="w-4 h-4" />
                Offer ends in
              </div>
              <div className="text-4xl font-bold text-white mt-2 tabular-nums">{remaining}</div>
              <Button
                size="lg"
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold"
                onClick={() => window.open('#bundle-offer', '_self')}
              >
                Reserve my bundle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
