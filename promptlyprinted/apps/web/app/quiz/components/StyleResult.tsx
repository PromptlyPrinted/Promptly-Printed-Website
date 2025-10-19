'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { StyleQuizAnswers } from '../page';
import { Sparkles, TrendingUp, Users, Gift } from 'lucide-react';
import {
  selectProductFromQuiz,
  generateAIPrompt,
  getProductDisplayName,
  determineGiveawayTier,
  GIVEAWAY_ITEMS,
  AI_MODEL_INFO,
} from '@/lib/quiz-product-selector';

type StyleResultProps = {
  answers: StyleQuizAnswers;
};

// Style personality mapping
const STYLE_PROFILES = {
  // Vibe-based profiles
  minimalist: {
    name: 'Minimal Visionary',
    description: 'You lean toward clean, confident looks that blend simplicity with sophistication. Less is always more in your world.',
    tribe: 'Minimalist Tribe',
    tribeCount: 2347,
  },
  streetwear: {
    name: 'Streetwear Icon',
    description: 'Bold, urban, and unapologetically expressive. You make statements with every piece you wear.',
    tribe: 'Streetwear Squad',
    tribeCount: 3891,
  },
  graphic: {
    name: 'Graphic Storyteller',
    description: 'Your style speaks volumes. You love designs that catch the eye and spark conversation.',
    tribe: 'Graphic Collective',
    tribeCount: 1923,
  },
  surreal: {
    name: 'Surreal Dreamer',
    description: 'You see fashion as art. Dreamlike, boundary-pushing designs are your signature.',
    tribe: 'Surreal Society',
    tribeCount: 1456,
  },
  futuristic: {
    name: 'Future Forward',
    description: 'Tech-inspired and ahead of the curve. You embrace the cutting edge of fashion innovation.',
    tribe: 'Futurist Collective',
    tribeCount: 2108,
  },
};

export const StyleResult = ({ answers }: StyleResultProps) => {
  const router = useRouter();

  // Generate personalized AI prompt using new logic
  const stylePrompt = useMemo(() => generateAIPrompt(answers), [answers]);

  // Select product SKU based on quiz answers
  const productSKU = useMemo(() => selectProductFromQuiz(answers), [answers]);

  // Get style profile
  const styleProfile = answers.vibe
    ? STYLE_PROFILES[answers.vibe as keyof typeof STYLE_PROFILES]
    : STYLE_PROFILES.minimalist;

  // Get product display name
  const productDisplayName = getProductDisplayName(
    answers.audience,
    answers.styleType
  );

  // Determine giveaway tier (standard for quiz completion)
  const giveawayTier = determineGiveawayTier({
    isFirstPurchase: false, // Will be determined at checkout
    hasEmailCaptured: false,
    isCampaign: !!answers.campaign && answers.campaign !== 'general',
  });
  const giveawayInfo = GIVEAWAY_ITEMS[giveawayTier];

  // Get AI model info if selected
  const aiModelInfo = answers.aiModel
    ? AI_MODEL_INFO[answers.aiModel]
    : null;

  // Handle CTA - go to offer page
  const handleGenerateDesign = () => {
    const params = new URLSearchParams({
      prompt: stylePrompt,
      style: answers.vibe || '',
      campaign: answers.campaign || 'general',
      source: 'style-quiz',
      productSKU: productSKU || '',
      audience: answers.audience || 'mens',
      styleType: answers.styleType || 'classic-tee',
      theme: answers.theme || 'everyday',
      aiModel: answers.aiModel || 'flux-dev',
      discount: giveawayInfo.discount.toString(),
      giveawayTier: giveawayTier,
      // Legacy compatibility
      clothingType: answers.styleType || 'tee',
    });

    // Go to offer page first (Step 4 in your flow)
    router.push(`/offer?${params.toString()}`);
  };

  const handleChangeStyle = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="text-2xl font-bold text-gray-900">Promptly Printed</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Result Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 mx-auto text-[#16C1A8] animate-pulse" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your AI Style:
            <br />
            <span className="bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] bg-clip-text text-transparent">
              {styleProfile.name}
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {styleProfile.description}
          </p>
        </div>

        {/* Tribe Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#16C1A8]/10 to-[#0D2C45]/10 rounded-full border border-[#16C1A8]/20">
            <Users className="w-5 h-5 text-[#16C1A8]" />
            <span className="text-gray-700">
              You're joining <strong className="text-[#16C1A8]">{styleProfile.tribeCount.toLocaleString()}</strong> others in the {styleProfile.tribe}
            </span>
            <TrendingUp className="w-5 h-5 text-[#16C1A8]" />
          </div>
        </div>

        {/* AI Prompt Preview */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16C1A8] to-[#0D2C45] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                We've preselected your ideal style prompt
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {stylePrompt}
              </p>
              {aiModelInfo && (
                <div className="mt-4 p-4 bg-[#16C1A8]/5 rounded-xl border border-[#16C1A8]/20">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    🤖 AI Model: {aiModelInfo.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {aiModelInfo.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Giveaway Offer */}
        <div className="bg-gradient-to-br from-[#16C1A8]/10 via-white to-[#0D2C45]/10 rounded-3xl border-2 border-[#16C1A8] p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#16C1A8] to-[#0D2C45] flex items-center justify-center flex-shrink-0">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 {giveawayInfo.name}!
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Get <strong className="text-[#16C1A8]">{Math.round(giveawayInfo.discount * 100)}% OFF</strong> your first {productDisplayName}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-[#16C1A8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Plus FREE bonus items with your order</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-[#16C1A8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Unlimited AI design generations</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-[#16C1A8]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>48-hour priority production</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Product */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Perfect for your {productDisplayName}
          </h3>
          <p className="text-gray-600 mb-4">
            Based on your preferences, we recommend starting with a premium {productDisplayName}.
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              ✓ Premium organic fabric
            </div>
            <div className="flex items-center gap-1">
              ✓ AI-powered customization
            </div>
            <div className="flex items-center gap-1">
              ✓ Fast dispatch
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button
            onClick={handleGenerateDesign}
            size="lg"
            className="bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white px-12 py-6 text-lg rounded-full hover:shadow-lg transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            See My Offer
          </Button>

          <Button
            onClick={handleChangeStyle}
            size="lg"
            variant="outline"
            className="border-gray-300 text-gray-700 px-8 py-6 text-lg rounded-full hover:bg-gray-50"
          >
            Change Style
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Free design toolkit included
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            First-drop discount applied
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            30-day quality guarantee
          </div>
        </div>
      </main>
    </div>
  );
};
