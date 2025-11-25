'use client';

import { useEffect, useState } from 'react';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';

type CreditInfo = {
  authenticated: boolean;
  credits?: {
    balance: number;
    welcomeCreditsRemaining: number;
    lifetimeCredits: number;
    lifetimeSpent: number;
  };
  guest?: {
    remaining: number;
    total: number;
    resetsIn: number;
    resetsAt: string;
  };
  signupOffer?: {
    credits: number;
    message: string;
  };
};

type CreditBalanceProps = {
  onBuyCredits?: () => void;
  showDetails?: boolean;
  compact?: boolean;
};

export function CreditBalance({ onBuyCredits, showDetails = false, compact = false }: CreditBalanceProps) {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      const data = await response.json();
      setCreditInfo(data);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Coins className="w-4 h-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!creditInfo) {
    return null;
  }

  // Authenticated User View
  if (creditInfo.authenticated && creditInfo.credits) {
    const { balance, welcomeCreditsRemaining } = creditInfo.credits;
    const isLow = balance < 10;
    const isVeryLow = balance < 3;

    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            isVeryLow ? 'bg-red-100 text-red-700' :
            isLow ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            <Coins className="w-4 h-4" />
            <span className="font-semibold">{balance}</span>
          </div>
          {isLow && onBuyCredits && (
            <Button
              size="sm"
              variant="outline"
              onClick={onBuyCredits}
              className="text-xs"
            >
              Buy More
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Your Credits</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${
                isVeryLow ? 'text-red-600' :
                isLow ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {balance}
              </span>
              <span className="text-sm text-gray-500">credits</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isVeryLow ? 'bg-red-100' :
            isLow ? 'bg-yellow-100' :
            'bg-green-100'
          }`}>
            <Coins className={`w-6 h-6 ${
              isVeryLow ? 'text-red-600' :
              isLow ? 'text-yellow-600' :
              'text-green-600'
            }`} />
          </div>
        </div>

        {welcomeCreditsRemaining > 0 && (
          <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Sparkles className="w-4 h-4" />
              <span>{welcomeCreditsRemaining} welcome credits remaining</span>
            </div>
          </div>
        )}

        {isLow && (
          <div className="mb-3 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Running low! Get more credits to continue generating.
            </p>
          </div>
        )}

        {showDetails && (
          <div className="mb-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Lifetime earned:</span>
                <p className="font-semibold text-gray-900">{creditInfo.credits.lifetimeCredits}</p>
              </div>
              <div>
                <span className="text-gray-500">Lifetime used:</span>
                <p className="font-semibold text-gray-900">{creditInfo.credits.lifetimeSpent}</p>
              </div>
            </div>
          </div>
        )}

        {onBuyCredits && (
          <Button
            onClick={onBuyCredits}
            className="w-full bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white"
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Buy More Credits
          </Button>
        )}
      </div>
    );
  }

  // Guest User View
  if (creditInfo.guest) {
    const { remaining, total, resetsIn } = creditInfo.guest;
    const isLast = remaining === 1;
    const isExhausted = remaining === 0;

    if (compact) {
      return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          isExhausted ? 'bg-red-100 text-red-700' :
          isLast ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">{remaining}/{total} free</span>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Free Generations</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${
                isExhausted ? 'text-red-600' :
                isLast ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {remaining}
              </span>
              <span className="text-sm text-gray-600">/ {total} remaining</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isExhausted ? 'bg-red-100' :
            isLast ? 'bg-yellow-100' :
            'bg-blue-100'
          }`}>
            <Sparkles className={`w-6 h-6 ${
              isExhausted ? 'text-red-600' :
              isLast ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
          </div>
        </div>

        {isExhausted ? (
          <div className="mb-3 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 mb-2">
              You've used all {total} free generations today!
            </p>
            <p className="text-xs text-red-600">
              Resets in {resetsIn} {resetsIn === 1 ? 'hour' : 'hours'}
            </p>
          </div>
        ) : isLast ? (
          <div className="mb-3 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Last free generation! Sign up to get {creditInfo.signupOffer?.credits || 50} credits.
            </p>
          </div>
        ) : null}

        <div className="bg-white rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-[#16C1A8] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {creditInfo.signupOffer?.message || 'Sign up for free!'}
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ {creditInfo.signupOffer?.credits || 50} free credits</li>
                <li>✓ Save your designs</li>
                <li>✓ Priority generation</li>
                <li>✓ Purchase more credits anytime</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={() => window.location.href = '/signup'}
          className="w-full bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white"
          size="sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Sign Up Free
        </Button>
      </div>
    );
  }

  return null;
}
