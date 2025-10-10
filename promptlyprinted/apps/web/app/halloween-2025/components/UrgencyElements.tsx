'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';

export const UrgencyElements = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [ordersLeft, setOrdersLeft] = useState(47); // Simulated scarcity

  useEffect(() => {
    // Calculate time until Halloween (October 31, 2025)
    const calculateTimeLeft = () => {
      const halloween = new Date('2025-10-31T23:59:59');
      const now = new Date();
      const difference = halloween.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate decreasing order capacity
    const orderTimer = setInterval(() => {
      setOrdersLeft(prev => Math.max(30, prev - Math.floor(Math.random() * 2)));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(orderTimer);
  }, []);

  const handleExpressOrder = () => {
    // Award points for express interest
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 100);
    }

    console.log('Navigate to express order flow');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1419] to-[#1a0b2e]">
      <div className="container mx-auto px-6">
        {/* Halloween Countdown */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Halloween Countdown
            </span>
          </h2>

          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((time, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4"
              >
                <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">
                  {time.value.toString().padStart(2, '0')}
                </div>
                <div className="text-orange-200 text-sm uppercase tracking-wide">
                  {time.label}
                </div>
              </div>
            ))}
          </div>

          <p className="text-orange-200 text-lg">
            Until Halloween 2025 - Don't get caught without your perfect costume!
          </p>
        </div>

        {/* Express Delivery Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 backdrop-blur-sm border border-red-500/40 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Last Call for Halloween Delivery!
              </h3>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <div className="text-center space-y-4">
              <p className="text-xl text-red-200">
                Order by <span className="font-bold text-orange-300">October 29th</span> to guarantee Halloween delivery
              </p>

              <div className="flex items-center justify-center gap-4 text-red-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>48-Hour Express Available</span>
                </div>
                <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Premium Rush Processing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scarcity Message */}
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/40 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">
                  Only <span className="text-orange-400 text-xl font-bold">{ordersLeft}</span> express delivery slots remaining for Halloween!
                </span>
              </div>
              <div className="text-purple-300 text-sm">
                Updates in real-time
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-purple-800/50 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(20, (ordersLeft / 100) * 100)}%` }}
                ></div>
              </div>
              <div className="text-purple-300 text-xs mt-2 text-center">
                Express delivery capacity filling fast
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6">
            <Button
              onClick={handleExpressOrder}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg py-6 rounded-xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              Secure Express Delivery Now
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-orange-500/50 text-orange-300 hover:bg-orange-900/30 font-bold text-lg py-6 rounded-xl"
            >
              <Clock className="w-5 h-5 mr-2" />
              Standard Delivery Available
            </Button>
          </div>

          {/* Guarantee */}
          <div className="text-center mt-8 text-purple-200">
            <p className="text-sm">
              🎃 <span className="font-semibold">Halloween Delivery Guarantee:</span> If your order doesn't arrive by October 31st, we'll refund your shipping and give you a £10 credit for next time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};