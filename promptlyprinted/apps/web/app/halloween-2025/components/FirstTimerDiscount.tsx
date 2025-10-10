'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Gift, X, Sparkles, Clock } from 'lucide-react';

export const FirstTimerDiscount = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    // Check if user has seen this before
    const hasSeenOffer = localStorage.getItem('halloweenFirstTimeOffer');

    if (!hasSeenOffer) {
      // Show popup after 30 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('halloweenFirstTimeOffer', 'seen');
  };

  const handleClaim = () => {
    // Award phantom points
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 300);
    }

    // Set discount code in localStorage
    localStorage.setItem('halloweenDiscountCode', 'SPOOKY15');
    localStorage.setItem('halloweenFirstTimeOffer', 'claimed');

    // Navigate to design tool
    window.location.href = '/design/halloween?discount=SPOOKY15';
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg z-10"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>

          {/* Popup Card */}
          <div className="bg-gradient-to-br from-orange-500 via-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 animate-bounce">
                <Gift className="w-20 h-20 text-white" />
              </div>
              <div className="absolute bottom-10 right-10 animate-pulse">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-block bg-yellow-400 text-gray-900 font-black px-6 py-2 rounded-full mb-6 animate-pulse">
                🎃 FIRST-TIME VISITOR OFFER
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Get 15% Off + Free Shipping!
              </h2>

              <p className="text-xl text-orange-100 mb-6">
                Welcome! Claim your exclusive first-time discount and start creating your perfect Halloween look.
              </p>

              {/* Offer Details */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300">15%</div>
                    <div className="text-white text-sm">OFF</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300">FREE</div>
                    <div className="text-white text-sm">Shipping</div>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center justify-between text-white">
                    <span>Plus, get:</span>
                    <span className="font-bold text-yellow-300">+300 👻 Points</span>
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-red-600/30 border border-red-500/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-300 animate-pulse" />
                  <div className="text-center">
                    <div className="text-white text-sm mb-1">This offer expires in:</div>
                    <div className="text-3xl font-black text-yellow-300 tabular-nums">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleClaim}
                size="lg"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black text-xl py-7 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl mb-4"
              >
                <Gift className="w-6 h-6 mr-2" />
                Claim My Discount Now
              </Button>

              {/* Fine Print */}
              <p className="text-xs text-center text-orange-100">
                Code: <span className="font-bold">SPOOKY15</span> • Valid for 24 hours • One use per customer
              </p>
            </div>
          </div>

          {/* Trust Badge Below */}
          <div className="mt-4 text-center">
            <p className="text-white text-sm">
              🔒 No credit card required • 100% Satisfaction Guarantee
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
