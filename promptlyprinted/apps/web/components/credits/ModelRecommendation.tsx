'use client';

import { Sparkles, Zap, TrendingUp, Crown } from 'lucide-react';
import { MODEL_CREDIT_COSTS } from '@/lib/credits-shared';

type ModelOption = {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  credits: number;
  icon: 'sparkles' | 'zap' | 'trending' | 'crown';
  tier: 'budget' | 'standard' | 'premium';
};

const MODELS: ModelOption[] = [
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    description: 'Fast and cost-effective',
    bestFor: 'Simple designs, text-heavy layouts, quick iterations',
    credits: 0.5,
    icon: 'zap',
    tier: 'budget',
  },
  {
    id: 'flux-dev',
    name: 'Flux Dev',
    description: 'Balanced quality and speed',
    bestFor: 'General purpose, logos, illustrations, everyday designs',
    credits: 1,
    icon: 'sparkles',
    tier: 'standard',
  },
  {
    id: 'lora-normal',
    name: 'LORA Normal',
    description: 'Enhanced artistic detail',
    bestFor: 'Complex artwork, character designs, vibrant colors',
    credits: 1,
    icon: 'trending',
    tier: 'standard',
  },
  {
    id: 'lora-context',
    name: 'LORA Context',
    description: 'Smart storytelling',
    bestFor: 'Narrative designs, themed collections, scene composition',
    credits: 1,
    icon: 'trending',
    tier: 'standard',
  },
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'Premium quality',
    bestFor: 'Professional designs, detailed artwork, commercial use',
    credits: 2,
    icon: 'crown',
    tier: 'premium',
  },
];

type ModelRecommendationProps = {
  selectedModel?: string;
  onModelSelect: (modelId: string) => void;
  currentBalance?: number;
  isGuest?: boolean;
  showCosts?: boolean;
};

const IconComponent = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'zap':
      return <Zap className="w-5 h-5" />;
    case 'trending':
      return <TrendingUp className="w-5 h-5" />;
    case 'crown':
      return <Crown className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

export function ModelRecommendation({
  selectedModel,
  onModelSelect,
  currentBalance,
  isGuest = false,
  showCosts = true,
}: ModelRecommendationProps) {
  const canAfford = (credits: number) => {
    if (isGuest) return true; // Guests don't pay
    if (currentBalance === undefined) return true; // Unknown balance, allow selection
    return currentBalance >= credits;
  };

  const getRecommendedModel = (): string => {
    if (isGuest) return 'nano-banana'; // Best value for guests

    if (currentBalance === undefined) return 'flux-dev'; // Default

    // Recommend based on balance
    if (currentBalance < 1) return 'nano-banana'; // Only budget option
    if (currentBalance < 10) return 'flux-dev'; // Conserve credits
    if (currentBalance >= 50) return 'nano-banana-pro'; // Can afford premium
    return 'flux-dev'; // Default standard
  };

  const recommended = getRecommendedModel();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Choose AI Model</h3>
        {!isGuest && showCosts && currentBalance !== undefined && (
          <div className="text-sm text-gray-600">
            Balance: <span className="font-semibold text-[#16C1A8]">{currentBalance}</span> credits
          </div>
        )}
      </div>

      {/* Model Options */}
      <div className="space-y-2">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          const isRecommended = model.id === recommended;
          const isAffordable = canAfford(model.credits);
          const isDisabled = !isAffordable;

          return (
            <button
              key={model.id}
              onClick={() => !isDisabled && onModelSelect(model.id)}
              disabled={isDisabled}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-[#16C1A8] bg-[#16C1A8]/5 shadow-md'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-[#16C1A8] hover:bg-[#16C1A8]/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    model.tier === 'premium' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    model.tier === 'budget' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                    'bg-gradient-to-br from-blue-400 to-indigo-500'
                  }`}>
                    <div className="text-white">
                      <IconComponent icon={model.icon} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{model.name}</h4>
                      {isRecommended && (
                        <span className="px-2 py-0.5 bg-[#16C1A8] text-white text-xs font-bold rounded-full">
                          RECOMMENDED
                        </span>
                      )}
                      {model.tier === 'premium' && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                          PRO
                        </span>
                      )}
                      {model.tier === 'budget' && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                          BUDGET
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                    <p className="text-xs text-gray-500">
                      <strong>Best for:</strong> {model.bestFor}
                    </p>
                  </div>
                </div>

                {/* Cost */}
                {showCosts && (
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <div className={`text-lg font-bold ${
                      isDisabled ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {model.credits}
                    </div>
                    <div className="text-xs text-gray-500">
                      {model.credits === 1 ? 'credit' : 'credits'}
                    </div>
                    {isDisabled && (
                      <div className="text-xs text-red-600 font-medium mt-1">
                        Insufficient
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-[#16C1A8]/20">
                  <div className="flex items-center gap-2 text-sm text-[#16C1A8] font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#16C1A8] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Selected
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Guest Info */}
      {isGuest && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> All models are free for your 3 daily generations.
            Sign up to get 50 credits and unlock unlimited access!
          </p>
        </div>
      )}

      {/* Low Balance Warning */}
      {!isGuest && currentBalance !== undefined && currentBalance < 10 && currentBalance > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Running low on credits!</strong> Consider purchasing more to continue using premium models.
          </p>
        </div>
      )}

      {/* Insufficient Credits */}
      {!isGuest && currentBalance !== undefined && currentBalance < 0.5 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            ❌ <strong>No credits remaining.</strong> Purchase a credit pack to continue generating images.
          </p>
        </div>
      )}
    </div>
  );
}
