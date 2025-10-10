'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Gift, Mail, Sparkles, X } from 'lucide-react';

export const EmailCaptureIncentive = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Award phantom points
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 200);
    }

    // TODO: Send to email capture API
    console.log('Email captured:', email);
    setIsSubmitted(true);

    // Hide after 3 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <section className="py-16 bg-gradient-to-r from-orange-600 to-purple-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-pulse">
          <Gift className="w-20 h-20 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce">
          <Sparkles className="w-16 h-16 text-white" />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {!isSubmitted ? (
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <div className="mb-8">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/30">
                <span className="text-white font-bold">🎃 EXCLUSIVE HALLOWEEN OFFER</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Get £5 Off Your First Design + Free Express Shipping!
              </h2>
              <p className="text-xl text-orange-100">
                Join 2,500+ Halloween enthusiasts and unlock instant savings
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-8 h-8 text-yellow-300" />
                  <div className="text-left flex-1">
                    <div className="text-white font-bold">What You'll Get:</div>
                    <ul className="text-orange-100 text-sm space-y-1 mt-2">
                      <li>✓ £5 instant discount code</li>
                      <li>✓ Free express shipping (48hrs)</li>
                      <li>✓ 200 bonus 👻 Phantom Points</li>
                      <li>✓ Exclusive Halloween design templates</li>
                    </ul>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold text-lg py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Claim My £5 Discount
                </Button>

                <p className="text-xs text-orange-100 mt-4">
                  No spam, ever. Unsubscribe anytime. By signing up, you agree to receive marketing emails.
                </p>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mt-6 text-white/80 text-sm">
              <div>🔒 Secure & Private</div>
              <div>•</div>
              <div>📧 2,547+ Subscribers</div>
              <div>•</div>
              <div>⭐ Rated 4.9/5</div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                🎉 Success! Check Your Email
              </h3>
              <p className="text-xl text-orange-100 mb-6">
                Your £5 discount code and free shipping voucher are on their way!
              </p>
              <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-xl p-4">
                <p className="text-white font-semibold">
                  + 200 👻 Phantom Points Added!
                </p>
                <p className="text-orange-100 text-sm mt-1">
                  You can use these points for additional discounts
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
