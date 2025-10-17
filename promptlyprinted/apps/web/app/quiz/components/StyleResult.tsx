'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { StyleQuizAnswers } from '../page';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

type StyleResultProps = {
  answers: StyleQuizAnswers;
};

// Product type display names
const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  'tee': 'classic t-shirt',
  'hoodie': 'hoodie',
  'long-sleeve': 'long sleeve t-shirt',
  'crewneck': 'crewneck sweatshirt',
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

  // Generate personalized AI prompt
  const stylePrompt = useMemo(() => {
    const vibeMap: Record<string, string> = {
      minimalist: 'minimal geometric design with clean lines and negative space',
      streetwear: 'bold urban streetwear graphic with graffiti-inspired elements',
      graphic: 'eye-catching graphic illustration with detailed artwork',
      surreal: 'dreamlike surreal artwork with abstract flowing elements',
      futuristic: 'futuristic tech-inspired design with cyberpunk aesthetics',
    };

    const colorMap: Record<string, string> = {
      'black-white': 'monochromatic black and white palette',
      'earth-tones': 'warm earth tone color palette with natural browns and greens',
      'neon': 'vibrant neon colors with electric glow effects',
      'pastels': 'soft pastel color scheme with gentle hues',
      'monochrome': 'single bold color focus with tonal variations',
    };

    const designPersonalityMap: Record<string, string> = {
      'simple-logo': 'as a clean minimalist logo',
      'illustration': 'as a detailed hand-drawn illustration',
      'abstract-art': 'as abstract artistic patterns',
      'text-heavy': 'with bold typography and text elements',
      'character': 'featuring a unique character design',
    };

    const locationContext: Record<string, string> = {
      everyday: 'versatile for daily wear',
      gym: 'dynamic with athletic energy',
      'night-out': 'statement-making for social occasions',
      'creative-work': 'professional yet creative',
      chill: 'relaxed and comfortable aesthetic',
    };

    const vibe = answers.vibe ? vibeMap[answers.vibe] : '';
    const colors = answers.colorPalette ? colorMap[answers.colorPalette] : '';
    const personality = answers.designPersonality ? designPersonalityMap[answers.designPersonality] : '';
    const context = answers.wearLocation ? locationContext[answers.wearLocation] : '';

    return `Create a ${vibe} ${personality} with ${colors}, ${context}. Optimize for apparel print with high contrast and bold details.`;
  }, [answers]);

  // Get style profile
  const styleProfile = answers.vibe ? STYLE_PROFILES[answers.vibe as keyof typeof STYLE_PROFILES] : STYLE_PROFILES.minimalist;

  // Get product display name
  const productDisplayName = answers.clothingType ? PRODUCT_DISPLAY_NAMES[answers.clothingType] : PRODUCT_DISPLAY_NAMES.tee;

  // Handle CTA - go to offer page
  const handleGenerateDesign = () => {
    const params = new URLSearchParams({
      prompt: stylePrompt,
      style: answers.vibe || '',
      campaign: answers.campaign || 'general',
      source: 'style-quiz',
      clothingType: answers.clothingType || 'tee',
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
              <p className="text-gray-600 leading-relaxed">
                {stylePrompt}
              </p>
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
