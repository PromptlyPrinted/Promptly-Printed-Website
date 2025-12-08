'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizStep } from '../../halloween-2025/quiz/components/QuizStep';
import { ChristmasStyleResult } from './components/ChristmasStyleResult';

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
  theme?: 'christmas' | 'everyday' | 'winter' | 'festive' | 'custom';
  generationMode?: 'text-only' | 'image-input'; // NEW: How user wants to generate
  aiModel?: 'flux-dev' | 'lora-normal' | 'lora-context' | 'nano-banana' | 'nano-banana-pro';
  colorPreference?: string;
  vibe?: string;
  colorPalette?: string;
  clothingType?: string; // Legacy field for backwards compatibility
  wearLocation?: string;
  designPersonality?: string;
  campaign?: string;
  // UTM tracking parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const TOTAL_STEPS = 9; // Added generation mode step

function ChristmasQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaign = searchParams.get('campaign') || 'christmas-2025';

  // Capture UTM parameters from URL
  const utmSource = searchParams.get('utm_source') || undefined;
  const utmMedium = searchParams.get('utm_medium') || undefined;
  const utmCampaign = searchParams.get('utm_campaign') || undefined;
  const utmContent = searchParams.get('utm_content') || undefined;
  const utmTerm = searchParams.get('utm_term') || undefined;

  // Capture referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store referral code in localStorage for use during checkout
      localStorage.setItem('referralCode', refCode);
      console.log('[Christmas Quiz] Referral code captured:', refCode);
    }
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<StyleQuizAnswers>({
    campaign,
    theme: 'christmas',
    // Store UTM params in answers to pass through the flow
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
  });
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
      router.push('/christmas-2025');
    }
  };

  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  if (showResults) {
    return <ChristmasStyleResult answers={answers} />;
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

      {/* Progress Bar - Christmas themed gradient */}
      <div className="w-full bg-gray-100 h-2">
        <div
          className="bg-gradient-to-r from-red-500 via-green-600 to-red-600 h-full transition-all duration-500"
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
                id: 'christmas',
                label: 'Christmas',
                description: 'Festive holiday magic',
                icon: '🎄',
              },
              {
                id: 'winter',
                label: 'Winter',
                description: 'Cozy winter vibes',
                icon: '❄️',
              },
              {
                id: 'festive',
                label: 'Festive Party',
                description: 'Holiday celebrations',
                icon: '🎉',
              },
              {
                id: 'everyday',
                label: 'Everyday Wear',
                description: 'Timeless, versatile designs',
                icon: '☀️',
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

        {/* Step 4: Generation Mode - Text-only or Image input */}
        {currentStep === 4 && (
          <QuizStep
            question="How do you want to create?"
            subtitle="Choose your design method"
            options={[
              {
                id: 'text-only',
                label: 'Text to Design',
                description: 'Describe your design in words – AI creates it from scratch',
                icon: '✍️',
              },
              {
                id: 'image-input',
                label: 'Image to Design',
                description: 'Upload a photo or image – AI transforms it into a design',
                icon: '📷',
              },
            ]}
            selectedValue={answers.generationMode}
            onSelect={(value) => updateAnswer('generationMode', value as any)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 5: AI Model Selection - Contextual based on generation mode */}
        {currentStep === 5 && (
          <QuizStep
            question="Choose your AI model"
            subtitle={answers.generationMode === 'image-input' 
              ? '🖼️ Image-to-Image: Transform or edit existing photos' 
              : '✨ Text-to-Image: Creative generation from descriptions'}
            options={
              answers.generationMode === 'image-input'
                ? [
                    {
                      id: 'lora-context',
                      label: 'Promptly Kontext LORAs ⭐',
                      description: 'Best quality transformations with consistent style across images',
                      icon: '🎨',
                    },
                    {
                      id: 'flux-dev',
                      label: 'Flux 2 Pro (1 credit)',
                      description: 'Multi-reference editing, photorealism, cinematic outputs',
                      icon: '⚡',
                    },
                    {
                      id: 'nano-banana',
                      label: 'Nano Banana (0.5 credits)',
                      description: 'Quick reference-based edits, fast previews',
                      icon: '🍌',
                    },
                    {
                      id: 'nano-banana-pro',
                      label: 'Nano Banana Pro (2 credits)',
                      description: 'Robust multi-image composites, high detail & realism',
                      icon: '🍌✨',
                    },
                  ]
                : [
                    {
                      id: 'lora-normal',
                      label: 'Promptly LORAs (Fine-tuned) ⭐',
                      description: 'Best for apparel designs, consistent style, fashion-focused',
                      icon: '🎨',
                    },
                    {
                      id: 'nano-banana',
                      label: 'Nano Banana (0.5 credits)',
                      description: 'Fast, budget-friendly, clean mockups',
                      icon: '🍌',
                    },
                    {
                      id: 'nano-banana-pro',
                      label: 'Nano Banana Pro (2 credits)',
                      description: 'Premium quality, complex scenes, text overlays',
                      icon: '🍌✨',
                    },
                  ]
            }
            selectedValue={answers.aiModel}
            onSelect={(value) => updateAnswer('aiModel', value as any)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 6: Christmas Style Vibe */}
        {currentStep === 6 && (
          <QuizStep
            question="What's your Christmas vibe?"
            subtitle="Choose the festive style that resonates with you"
            options={[
              {
                id: 'cozy-traditional',
                label: 'Cozy Traditional',
                description: 'Classic holiday warmth, fireplace vibes',
                icon: '🏠',
              },
              {
                id: 'festive-fun',
                label: 'Festive Fun',
                description: 'Playful, cheerful holiday spirit',
                icon: '🎅',
              },
              {
                id: 'winter-wonderland',
                label: 'Winter Wonderland',
                description: 'Magical snowy landscapes',
                icon: '❄️',
              },
              {
                id: 'modern-minimal',
                label: 'Modern Minimal',
                description: 'Sleek, contemporary holiday style',
                icon: '✨',
              },
              {
                id: 'retro-vintage',
                label: 'Retro Vintage',
                description: 'Nostalgic, classic Christmas feel',
                icon: '📻',
              },
            ]}
            selectedValue={answers.vibe}
            onSelect={(value) => updateAnswer('vibe', value)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 7: Color Palette */}
        {currentStep === 7 && (
          <QuizStep
            question="Preferred color palette?"
            subtitle="Select colors that match your style"
            options={[
              {
                id: 'christmas-classic',
                label: 'Christmas Red & Green',
                description: 'Traditional festive colors',
                icon: '🎄',
              },
              {
                id: 'winter-whites',
                label: 'Winter Whites',
                description: 'Snowy, elegant tones',
                icon: '❄️',
              },
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
                id: 'festive-metallics',
                label: 'Festive Metallics',
                description: 'Gold, silver sparkle',
                icon: '✨',
              },
            ]}
            selectedValue={answers.colorPalette}
            onSelect={(value) => updateAnswer('colorPalette', value)}
            onContinue={goToNextStep}
          />
        )}

        {/* Step 8: Wear Location */}
        {currentStep === 8 && (
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
                id: 'holiday-parties',
                label: 'Holiday Parties',
                description: 'Festive gatherings',
                icon: '🎉',
              },
              {
                id: 'winter-outdoor',
                label: 'Winter Outdoor',
                description: 'Cold weather activities',
                icon: '⛄',
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

        {/* Step 9: Christmas Design Personality */}
        {currentStep === 9 && (
          <QuizStep
            question="What Christmas design style?"
            subtitle="Choose your preferred festive design look"
            options={[
              {
                id: 'cute-characters',
                label: 'Cute Characters',
                description: 'Santa, reindeer, snowmen, elves',
                icon: '🎅',
              },
              {
                id: 'festive-typography',
                label: 'Festive Typography',
                description: 'Holiday quotes & lettering',
                icon: '✍️',
              },
              {
                id: 'christmas-scene',
                label: 'Christmas Scene',
                description: 'Snow scenes, trees, landscapes',
                icon: '🎄',
              },
              {
                id: 'ugly-sweater',
                label: 'Ugly Sweater Style',
                description: 'Fun, tacky holiday patterns',
                icon: '🧶',
              },
              {
                id: 'elegant-ornaments',
                label: 'Elegant Ornaments',
                description: 'Sophisticated holiday décor',
                icon: '🔔',
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

export default function ChristmasQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading quiz...</div>
      </div>
    }>
      <ChristmasQuizContent />
    </Suspense>
  );
}
