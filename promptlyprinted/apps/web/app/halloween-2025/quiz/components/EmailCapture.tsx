'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import Image from 'next/image';

type EmailCaptureProps = {
  onSubmit: (email: string) => void;
  onSkip: () => void;
};

export const EmailCapture = ({ onSubmit, onSkip }: EmailCaptureProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubmit(email);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-3xl p-12 shadow-lg">
        {/* Progress Indicator */}
        <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto mb-8" />

        {/* Product Preview */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🎃</span>
            </div>
            <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">👻</span>
            </div>
            <div className="relative aspect-square bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🦇</span>
            </div>
            <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🕷️</span>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Almost there!
        </h2>

        <p className="text-gray-700 text-center mb-8">
          Before we match you with your perfect Halloween apparel, join thousands of
          creators already in the know. Get your results + 10% off your first order.
        </p>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-orange-500 transition"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg bg-black text-white hover:bg-gray-800 rounded-full transition-all"
          >
            Get My Results
          </Button>
        </form>

        {/* Privacy Note */}
        <p className="text-sm text-gray-500 text-center mt-4">
          This is optional. You can unsubscribe at any time. Please see our{' '}
          <a href="/privacy" className="underline hover:text-gray-700">
            privacy policy
          </a>
          .
        </p>

        {/* Skip Option */}
        <button
          onClick={onSkip}
          className="text-orange-600 hover:text-orange-700 font-medium text-center w-full mt-6 underline"
        >
          No thanks, show me the results.
        </button>
      </div>
    </div>
  );
};
