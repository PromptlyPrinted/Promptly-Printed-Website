'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, TrendingUp, Users, Gift, Trophy } from 'lucide-react';
import {
  selectProductFromQuiz,
  generateAIPrompt,
  getProductDisplayName,
  AI_MODEL_INFO,
} from '@/lib/quiz-product-selector';

type StyleQuizAnswers = {
  audience?: 'mens' | 'womens' | 'kids' | 'babies';
  styleType?: string;
  theme?: string;
  aiModel?: 'flux-dev' | 'lora-normal' | 'lora-context' | 'nano-banana' | 'nano-banana-pro';
  vibe?: string;
  campaign?: string;
  [key: string]: any;
};

type StyleResultProps = {
  answers: StyleQuizAnswers;
};

const STYLE_PROFILES = {
  minimalist: {
    name: 'Minimal Visionary',
    description: 'You lean toward clean, confident looks that blend simplicity with sophistication. Less is always more in your festive world.',
    tribe: 'Minimalist Tribe',
    tribeCount: 2347,
  },
  streetwear: {
    name: 'Streetwear Icon',
    description: 'Bold, urban, and unapologetically expressive. You make festive statements with every piece you wear.',
    tribe: 'Streetwear Squad',
    tribeCount: 3891,
  },
  graphic: {
    name: 'Graphic Storyteller',
    description: 'Your Christmas style speaks volumes. You love designs that catch the eye and spread holiday joy.',
    tribe: 'Graphic Collective',
    tribeCount: 1923,
  },
  surreal: {
    name: 'Surreal Dreamer',
    description: 'You see holiday fashion as art. Dreamlike, magical designs are your Christmas signature.',
    tribe: 'Surreal Society',
    tribeCount: 1456,
  },
  futuristic: {
    name: 'Future Forward',
    description: 'Tech-inspired and ahead of the curve. You embrace the cutting edge of festive fashion innovation.',
    tribe: 'Futurist Collective',
    tribeCount: 2108,
  },
};

export const ChristmasStyleResult = ({ answers }: StyleResultProps) => {
  const router = useRouter();

  const stylePrompt = useMemo(() => generateAIPrompt(answers), [answers]);
  const productSKU = useMemo(() => selectProductFromQuiz(answers), [answers]);

  const styleProfile = answers.vibe
    ? STYLE_PROFILES[answers.vibe as keyof typeof STYLE_PROFILES]
    : STYLE_PROFILES.minimalist;

  const productDisplayName = getProductDisplayName(
    answers.audience,
    answers.styleType
  );

  const aiModelInfo = answers.aiModel ? AI_MODEL_INFO[answers.aiModel] : null;

  const handleGenerateDesign = () => {
    const params = new URLSearchParams({
      prompt: stylePrompt,
      style: answers.vibe || '',
      campaign: answers.campaign || 'christmas-2025',
      source: 'christmas-quiz',
      productSKU: productSKU || '',
      audience: answers.audience || 'mens',
      styleType: answers.styleType || 'classic-tee',
      theme: answers.theme || 'christmas',
      aiModel: answers.aiModel || 'flux-dev',
      clothingType: answers.styleType || 'tee',
    });

    // Preserve UTM parameters through the flow
    if (answers.utm_source) params.set('utm_source', answers.utm_source);
    if (answers.utm_medium) params.set('utm_medium', answers.utm_medium);
    if (answers.utm_campaign) params.set('utm_campaign', answers.utm_campaign);
    if (answers.utm_content) params.set('utm_content', answers.utm_content);
    if (answers.utm_term) params.set('utm_term', answers.utm_term);

    router.push(`/offer?${params.toString()}`);
  };

  const handleChangeStyle = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="text-2xl font-bold text-gray-900">Promptly Printed</div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 mx-auto text-red-500 animate-pulse" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your AI Style:
            <br />
            <span className="bg-gradient-to-r from-red-500 via-green-600 to-red-600 bg-clip-text text-transparent">
              {styleProfile.name}
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {styleProfile.description}
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500/10 to-green-600/10 rounded-full border border-red-500/20">
            <Users className="w-5 h-5 text-red-600" />
            <span className="text-gray-700">
              You're joining <strong className="text-red-600">{styleProfile.tribeCount.toLocaleString()}</strong> others in the {styleProfile.tribe}
            </span>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center flex-shrink-0">
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
                <div className="mt-4 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
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

        {/* Christmas Competition Offer */}
        <div className="bg-gradient-to-br from-red-500/10 via-white to-green-600/10 rounded-3xl border-2 border-red-500 p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎄 Enter to Win $500 USD Cash!
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Complete your purchase and you'll be automatically entered into our <strong className="text-red-600">$500 USD</strong> Christmas competition!
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Purchase required to enter</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Earn 5 points per like on your design</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Upload wearing photo for +100 points</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Follow us on social for +50 bonus points</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Winner announced January 5th, 2026</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  *Competition runs Dec 1-31, 2025. Entry requires purchase. Most points wins $500 USD cash prize.
                </p>
              </div>
            </div>
          </div>
        </div>

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

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button
            onClick={handleGenerateDesign}
            size="lg"
            className="bg-gradient-to-r from-red-500 via-green-600 to-red-600 text-white px-12 py-6 text-lg rounded-full hover:shadow-lg transition-all"
          >
            <Gift className="w-5 h-5 mr-2" />
            Create Design & Enter Competition
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

        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Christmas exclusive competition
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Ends December 31st
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
