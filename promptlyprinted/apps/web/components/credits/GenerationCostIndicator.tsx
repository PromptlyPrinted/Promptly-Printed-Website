'use client';

import { Coins, AlertCircle, Sparkles } from 'lucide-react';
import { MODEL_CREDIT_COSTS } from '@/lib/credits-shared';

type GenerationCostIndicatorProps = {
  modelName: string;
  currentBalance?: number;
  isGuest?: boolean;
  guestRemaining?: number;
  compact?: boolean;
};

const MODEL_NAMES: Record<string, string> = {
  'flux-dev': 'Flux Dev',
  'lora-normal': 'LORA Normal',
  'lora-context': 'LORA Context',
  'nano-banana': 'Nano Banana',
  'nano-banana-pro': 'Nano Banana Pro',
  'gemini-flash': 'Gemini Flash',
};

export function GenerationCostIndicator({
  modelName,
  currentBalance,
  isGuest = false,
  guestRemaining,
  compact = false,
}: GenerationCostIndicatorProps) {
  const cost = MODEL_CREDIT_COSTS[modelName] || 1;
  const displayName = MODEL_NAMES[modelName] || modelName;

  // Guest user view
  if (isGuest) {
    const remaining = guestRemaining ?? 3;
    const isLast = remaining === 1;
    const willExhaust = remaining === 0;

    if (compact) {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
          willExhaust ? 'bg-red-100 text-red-700' :
          isLast ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">Free ({remaining} left)</span>
        </div>
      );
    }

    if (willExhaust) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                No credits remaining
              </p>
              <p className="text-xs text-red-600 mt-1">
                You've used all your free credits. Sign up to get 50 credits per month!
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-lg p-3 border ${
        isLast
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${
              isLast ? 'text-yellow-600' : 'text-blue-600'
            }`} />
            <div>
              <p className={`text-sm font-semibold ${
                isLast ? 'text-yellow-800' : 'text-blue-800'
              }`}>
                Free Credit
              </p>
              <p className={`text-xs ${
                isLast ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {remaining} {remaining === 1 ? 'credit' : 'credits'} remaining
              </p>
            </div>
          </div>
          {isLast && (
            <div className="text-xs text-yellow-700 font-medium">
              Last one!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authenticated user view
  const hasEnough = currentBalance !== undefined && currentBalance >= cost;
  const isLow = currentBalance !== undefined && currentBalance < 10 && currentBalance >= cost;
  const isInsufficient = !hasEnough;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
        isInsufficient ? 'bg-red-100 text-red-700' :
        isLow ? 'bg-yellow-100 text-yellow-700' :
        'bg-green-100 text-green-700'
      }`}>
        <Coins className="w-3 h-3" />
        <span className="font-medium">{cost} {cost === 1 ? 'credit' : 'credits'}</span>
      </div>
    );
  }

  if (isInsufficient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Insufficient credits
            </p>
            <p className="text-xs text-red-600 mt-1">
              You need {cost} {cost === 1 ? 'credit' : 'credits'} but only have {currentBalance}.
              Purchase more credits to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-3 border ${
      isLow
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className={`w-5 h-5 ${
            isLow ? 'text-yellow-600' : 'text-green-600'
          }`} />
          <div>
            <p className={`text-sm font-semibold ${
              isLow ? 'text-yellow-800' : 'text-green-800'
            }`}>
              {displayName}
            </p>
            <p className={`text-xs ${
              isLow ? 'text-yellow-600' : 'text-green-600'
            }`}>
              Costs {cost} {cost === 1 ? 'credit' : 'credits'}
              {currentBalance !== undefined && ` • ${currentBalance} remaining`}
            </p>
          </div>
        </div>
        {isLow && (
          <div className="text-xs text-yellow-700 font-medium">
            Running low
          </div>
        )}
      </div>
    </div>
  );
}
