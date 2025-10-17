'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizStep } from './components/QuizStep';
import { EmailCapture } from './components/EmailCapture';
import { QuizResults } from './components/QuizResults';

export type QuizAnswers = {
  motivation?: string;
  style?: string;
  product?: string;
  priority?: string;
  email?: string;
};

const TOTAL_STEPS = 5;

export default function HalloweenQuizPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showResults, setShowResults] = useState(false);

  const updateAnswer = (key: keyof QuizAnswers, value: string) => {
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
      router.push('/halloween-2025');
    }
  };

  const handleEmailSubmit = (email: string) => {
    updateAnswer('email', email);
    setShowResults(true);
  };

  const handleSkipEmail = () => {
    setShowResults(true);
  };

  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  if (showResults) {
    return <QuizResults answers={answers} />;
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2">
        <div
          className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quiz Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {currentStep === 1 && (
          <QuizStep
            question="Why are you creating custom Halloween apparel?"
            subtitle="(Select all that apply)"
            options={[
              {
                id: 'self',
                label: 'For myself',
                description: 'A unique piece just for me',
                icon: '👤',
              },
              {
                id: 'squad',
                label: 'Squad goals',
                description: 'Matching designs for my crew',
                icon: '👥',
              },
              {
                id: 'family',
                label: 'Family matching',
                description: 'Coordinated looks for the whole family',
                icon: '👨‍👩‍👧‍👦',
              },
              {
                id: 'business',
                label: 'Selling to customers',
                description: 'Creating a drop for my brand/audience',
                icon: '💼',
              },
            ]}
            selectedValue={answers.motivation}
            onSelect={(value) => updateAnswer('motivation', value)}
            onContinue={goToNextStep}
          />
        )}

        {currentStep === 2 && (
          <QuizStep
            question="What's your Halloween vibe?"
            options={[
              {
                id: 'dark-spooky',
                label: 'Spooky & Dark',
                description: 'Gothic, creepy, Halloween classic',
                icon: '🦇',
              },
              {
                id: 'cute-playful',
                label: 'Cute & Playful',
                description: 'Friendly ghosts, candy corn vibes',
                icon: '👻',
              },
              {
                id: 'retro-horror',
                label: 'Retro Horror',
                description: '80s slasher, VHS aesthetic',
                icon: '📼',
              },
              {
                id: 'minimal-modern',
                label: 'Minimal Modern',
                description: 'Clean, sophisticated Halloween',
                icon: '✨',
              },
            ]}
            selectedValue={answers.style}
            onSelect={(value) => updateAnswer('style', value)}
            onContinue={goToNextStep}
          />
        )}

        {currentStep === 3 && (
          <QuizStep
            question="What are you looking to create?"
            options={[
              {
                id: 'hoodie',
                label: 'Hoodie',
                description: 'Cozy heavyweight pullover',
                icon: '🧥',
              },
              {
                id: 'tee',
                label: 'T-Shirt',
                description: 'Classic unisex tee',
                icon: '👕',
              },
              {
                id: 'crewneck',
                label: 'Crewneck',
                description: 'Vintage fleece sweatshirt',
                icon: '👚',
              },
              {
                id: 'bundle',
                label: 'Full Set',
                description: 'Mix multiple pieces',
                icon: '🎁',
              },
            ]}
            selectedValue={answers.product}
            onSelect={(value) => updateAnswer('product', value)}
            onContinue={goToNextStep}
          />
        )}

        {currentStep === 4 && (
          <QuizStep
            question="What matters most to you?"
            options={[
              {
                id: 'fast-delivery',
                label: 'Fast delivery',
                description: 'Get it before Halloween',
                icon: '⚡',
              },
              {
                id: 'best-price',
                label: 'Best price',
                description: 'Maximum value for money',
                icon: '💰',
              },
              {
                id: 'premium-quality',
                label: 'Premium quality',
                description: 'Heavyweight organic cotton',
                icon: '⭐',
              },
              {
                id: 'unique-design',
                label: 'Unique design',
                description: 'Stand out from everyone else',
                icon: '🎨',
              },
            ]}
            selectedValue={answers.priority}
            onSelect={(value) => updateAnswer('priority', value)}
            onContinue={goToNextStep}
          />
        )}

        {currentStep === 5 && (
          <EmailCapture
            onSubmit={handleEmailSubmit}
            onSkip={handleSkipEmail}
          />
        )}
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 opacity-10 pointer-events-none">
        <img src="/halloween-strawberry.png" alt="" className="w-32 h-32" />
      </div>
      <div className="fixed bottom-20 left-10 opacity-10 pointer-events-none">
        <img src="/halloween-strawberry.png" alt="" className="w-24 h-24" />
      </div>
    </div>
  );
}
