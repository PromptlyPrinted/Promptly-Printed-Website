'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizStep } from './components/QuizStep';
import { StyleResult } from './components/StyleResult';

export type StyleQuizAnswers = {
  vibe?: string;
  colorPalette?: string;
  clothingType?: string;
  wearLocation?: string;
  designPersonality?: string;
  campaign?: string; // halloween, black-friday, christmas, etc.
};

const TOTAL_STEPS = 5;

export default function StyleQuizPage() {
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
        {currentStep === 1 && (
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

        {currentStep === 2 && (
          <QuizStep
            question="Preferred color palette?"
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

        {currentStep === 3 && (
          <QuizStep
            question="Favorite clothing type?"
            options={[
              {
                id: 'tee',
                label: 'T-Shirt',
                description: 'Classic everyday wear',
                icon: '👕',
              },
              {
                id: 'hoodie',
                label: 'Hoodie',
                description: 'Cozy and statement-making',
                icon: '🧥',
              },
              {
                id: 'long-sleeve',
                label: 'Long Sleeve',
                description: 'Versatile layering piece',
                icon: '👚',
              },
              {
                id: 'crewneck',
                label: 'Crewneck',
                description: 'Timeless sweatshirt style',
                icon: '👔',
              },
            ]}
            selectedValue={answers.clothingType}
            onSelect={(value) => updateAnswer('clothingType', value)}
            onContinue={goToNextStep}
          />
        )}

        {currentStep === 4 && (
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

        {currentStep === 5 && (
          <QuizStep
            question="Design personality?"
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
