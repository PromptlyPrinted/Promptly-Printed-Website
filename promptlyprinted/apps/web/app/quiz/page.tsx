'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizStep } from './components/QuizStep';
import { StyleResult } from './components/StyleResult';

export type StyleQuizAnswers = {
  audience?: 'mens' | 'womens' | 'kids' | 'babies';
  styleType?:
    | 'classic-tee'
    | 'v-neck'
    | 'triblend'
    | 'tank-top'
    | 'long-sleeve'
    | 'hoodie'
    | 'sweatshirt'
    | 'bodysuit'
    | 'baseball-tee';
  theme?: 'halloween' | 'everyday' | 'christmas' | 'summer' | 'custom';
  aiModel?: 'flux-dev' | 'lora-normal' | 'lora-context' | 'nano-banana' | 'nano-banana-pro';
  colorPreference?: string;
  vibe?: string;
  colorPalette?: string;
  clothingType?: string; // Legacy field for backwards compatibility
  wearLocation?: string;
  designPersonality?: string;
  campaign?: string;
};

const TOTAL_STEPS = 8;

function StyleQuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaign = searchParams.get('campaign') || 'general';

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<StyleQuizAnswers>({ campaign });
  const [showResults, setShowResults] = useState(false);

  const updateAnswer = (key: keyof StyleQuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push('/');
    }
  };

  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  if (showResults) {
    return <StyleResult answers={answers} />;
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2">
        <div
          className="bg-gradient-to-r from-[#16C1A8] to-[#16C1A8] h-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quiz Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Step 1: Audience Selection */}
        {currentStep === 1 && (
          <QuizStep
            question="Who's this for?"
            subtitle="Select your target audience"
            options={[
              {
                id: 'mens',
                label: "Men's",
                description: 'Classic and modern men\'s apparel',
                icon: '👨',
              },
              {
                id: 'womens',
                label: "Women's",
                description: 'Stylish women\'s clothing',
                icon: '👩',
              },
              {
                id: 'kids',
                label: 'Kids',
                description: 'Fun designs for children',
                icon: '👦',
              },
              {
                id: 'babies',
                label: 'Babies',
                description: 'Adorable baby apparel',
                icon: '👶',
              },
            ]}
            selectedValue={answers.audience}
            onSelect={(value) => updateAnswer('audience', value as any)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 2: Style Type Selection */}
        {currentStep === 2 && (
          <QuizStep
            question="What style do you prefer?"
            subtitle="Choose your garment type"
            options={
              // Dynamically show options based on audience
              answers.audience === 'babies'
                ? [
                    {
                      id: 'bodysuit',
                      label: 'Bodysuit',
                      description: 'Comfortable baby bodysuit',
                      icon: '👕',
                    },
                    {
                      id: 'classic-tee',
                      label: 'Baby Tee',
                      description: 'Cute baby t-shirt',
                      icon: '👶',
                    },
                  ]
                : answers.audience === 'kids'
                  ? [
                      {
                        id: 'classic-tee',
                        label: 'Kids Tee',
                        description: 'Classic t-shirt for kids',
                        icon: '👕',
                      },
                      {
                        id: 'hoodie',
                        label: 'Kids Hoodie',
                        description: 'Cozy hoodie for kids',
                        icon: '🧥',
                      },
                      {
                        id: 'sweatshirt',
                        label: 'Sweatshirt',
                        description: 'Comfortable kids sweatshirt',
                        icon: '👔',
                      },
                    ]
                  : answers.audience === 'womens'
                    ? [
                        {
                          id: 'classic-tee',
                          label: 'Classic Tee',
                          description: 'Everyday women\'s t-shirt',
                          icon: '👕',
                        },
                        {
                          id: 'v-neck',
                          label: 'V-Neck',
                          description: 'Flattering v-neck style',
                          icon: '👚',
                        },
                        {
                          id: 'hoodie',
                          label: 'Hoodie',
                          description: 'Cozy and stylish',
                          icon: '🧥',
                        },
                      ]
                    : // Default to men's options
                      [
                        {
                          id: 'classic-tee',
                          label: 'Classic Tee',
                          description: 'Timeless everyday wear',
                          icon: '👕',
                        },
                        {
                          id: 'v-neck',
                          label: 'V-Neck',
                          description: 'Modern v-neck style',
                          icon: '👚',
                        },
                        {
                          id: 'triblend',
                          label: 'Triblend',
                          description: 'Ultra-soft premium blend',
                          icon: '✨',
                        },
                        {
                          id: 'tank-top',
                          label: 'Tank Top',
                          description: 'Athletic sleeveless style',
                          icon: '🎽',
                        },
                        {
                          id: 'long-sleeve',
                          label: 'Long Sleeve',
                          description: 'Year-round versatility',
                          icon: '👔',
                        },
                        {
                          id: 'hoodie',
                          label: 'Hoodie',
                          description: 'Statement comfort piece',
                          icon: '🧥',
                        },
                        {
                          id: 'baseball-tee',
                          label: 'Baseball Tee',
                          description: 'Sporty raglan style',
                          icon: '⚾',
                        },
                      ]
            }
            selectedValue={answers.styleType}
            onSelect={(value) => updateAnswer('styleType', value as any)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 3: Theme/Occasion */}
        {currentStep === 3 && (
          <QuizStep
            question="What's the occasion?"
            subtitle="Choose your design theme"
            options={[
              {
                id: 'everyday',
                label: 'Everyday Wear',
                description: 'Timeless, versatile designs',
                icon: '☀️',
              },
              {
                id: 'halloween',
                label: 'Halloween',
                description: 'Spooky seasonal vibes',
                icon: '🎃',
              },
              {
                id: 'christmas',
                label: 'Christmas',
                description: 'Festive holiday cheer',
                icon: '🎄',
              },
              {
                id: 'summer',
                label: 'Summer',
                description: 'Bright tropical vibes',
                icon: '🌴',
              },
              {
                id: 'custom',
                label: 'Custom',
                description: 'Fully personalized',
                icon: '🎨',
              },
            ]}
            selectedValue={answers.theme}
            onSelect={(value) => updateAnswer('theme', value as any)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 4: AI Model Selection */}
        {currentStep === 4 && (
          <QuizStep
            question="Choose your AI model"
            subtitle="Each model has unique strengths"
            options={[
              {
                id: 'flux-dev',
                label: 'Flux Dev',
                description: 'Balanced, versatile, high quality (1 credit)',
                icon: '⚡',
              },
              {
                id: 'lora-normal',
                label: 'LORA Normal',
                description: 'Artistic detail, vibrant colors (1 credit)',
                icon: '🎨',
              },
              {
                id: 'lora-context',
                label: 'LORA Context',
                description: 'Smart themes, storytelling (1 credit)',
                icon: '📖',
              },
              {
                id: 'nano-banana',
                label: 'Nano Banana',
                description: 'Fast, clean, minimalist (0.5 credits)',
                icon: '🍌',
              },
              {
                id: 'nano-banana-pro',
                label: 'Nano Banana 2',
                description: 'Advanced, 6-image input (2 credits)',
                icon: '🚀',
              },
            ]}
            selectedValue={answers.aiModel}
            onSelect={(value) => updateAnswer('aiModel', value as any)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 5: Original Vibe Question */}
        {currentStep === 5 && (
          <QuizStep
            question="What's your vibe?"
            subtitle="Choose the style that resonates with you"
            options={[
              {
                id: 'minimalist',
                label: 'Minimalist',
                description: 'Clean lines, simple elegance',
                icon: '⚪',
              },
              {
                id: 'streetwear',
                label: 'Streetwear',
                description: 'Urban, bold, statement-making',
                icon: '🔥',
              },
              {
                id: 'graphic',
                label: 'Graphic',
                description: 'Eye-catching designs, expressive',
                icon: '🎨',
              },
              {
                id: 'surreal',
                label: 'Surreal',
                description: 'Dreamy, artistic, unique',
                icon: '🌙',
              },
              {
                id: 'futuristic',
                label: 'Futuristic',
                description: 'Tech-inspired, modern edge',
                icon: '🚀',
              },
            ]}
            selectedValue={answers.vibe}
            onSelect={(value) => updateAnswer('vibe', value)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 6: Color Palette */}
        {currentStep === 6 && (
          <QuizStep
            question="Preferred color palette?"
            subtitle="Select colors that match your style"
            options={[
              {
                id: 'black-white',
                label: 'Black & White',
                description: 'Classic monochrome',
                icon: '⚫',
              },
              {
                id: 'earth-tones',
                label: 'Earth Tones',
                description: 'Natural, warm colors',
                icon: '🌿',
              },
              {
                id: 'neon',
                label: 'Neon',
                description: 'Bright, electric vibes',
                icon: '💥',
              },
              {
                id: 'pastels',
                label: 'Pastels',
                description: 'Soft, calming hues',
                icon: '🌸',
              },
              {
                id: 'monochrome',
                label: 'Monochrome',
                description: 'Single color focus',
                icon: '🎭',
              },
            ]}
            selectedValue={answers.colorPalette}
            onSelect={(value) => updateAnswer('colorPalette', value)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 7: Wear Location */}
        {currentStep === 7 && (
          <QuizStep
            question="Where do you wear your style most?"
            options={[
              {
                id: 'everyday',
                label: 'Everyday',
                description: 'Casual daily wear',
                icon: '☀️',
              },
              {
                id: 'gym',
                label: 'Gym',
                description: 'Active lifestyle',
                icon: '💪',
              },
              {
                id: 'night-out',
                label: 'Night Out',
                description: 'Social occasions',
                icon: '🌃',
              },
              {
                id: 'creative-work',
                label: 'Creative Work',
                description: 'Studio, office, events',
                icon: '💼',
              },
              {
                id: 'chill',
                label: 'Chill',
                description: 'Relaxed comfort',
                icon: '🛋️',
              },
            ]}
            selectedValue={answers.wearLocation}
            onSelect={(value) => updateAnswer('wearLocation', value)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 8: Design Personality */}
        {currentStep === 8 && (
          <QuizStep
            question="Design personality?"
            subtitle="Choose your preferred design style"
            options={[
              {
                id: 'simple-logo',
                label: 'Simple Logo',
                description: 'Clean branding aesthetic',
                icon: '✨',
              },
              {
                id: 'illustration',
                label: 'Illustration',
                description: 'Artistic hand-drawn style',
                icon: '🖌️',
              },
              {
                id: 'abstract-art',
                label: 'Abstract Art',
                description: 'Creative, unique patterns',
                icon: '🎨',
              },
              {
                id: 'text-heavy',
                label: 'Text-Heavy',
                description: 'Typography-focused',
                icon: '📝',
              },
              {
                id: 'character',
                label: 'Character',
                description: 'Mascots, personas',
                icon: '👾',
              },
            ]}
            selectedValue={answers.designPersonality}
            onSelect={(value) => updateAnswer('designPersonality', value)}
            onContinue={goToNextStep}
          />
        )}
      </main>
    </div>
  );
}

export default function StyleQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading quiz...</div>
      </div>
    }>
      <StyleQuizPageContent />
    </Suspense>
  );
}
