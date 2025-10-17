'use client';

import { useMemo, useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, ArrowRight, Palette, Ghost, Wand2 } from 'lucide-react';

type StepKey = 'style' | 'audience' | 'product';

interface QuizAnswers {
  style: string;
  audience: string;
  productFocus: string;
}

interface DesignQuizProps {
  leadEmail?: string | null;
  onComplete: (answers: QuizAnswers) => void;
}

const styleOptions = [
  { id: 'retro-ghoul', label: 'Retro Ghoul', description: 'Vintage poster art, bold typography' },
  { id: 'modern-luxe', label: 'Modern Luxe', description: 'Minimalist gradients, neon highlights' },
  { id: 'dark-fantasy', label: 'Dark Fantasy', description: 'Cinematic illustration, dramatic lighting' },
  { id: 'cartoon-chaos', label: 'Cartoon Chaos', description: 'Playful spooky characters, bold outlines' },
];

const audienceOptions = [
  { id: 'self', label: 'Just me', description: 'Signature look that stands out anywhere' },
  { id: 'squad', label: 'My squad', description: 'Coordinated fits for the entire crew' },
  { id: 'customers', label: 'My customers', description: 'Limited drop for your community or brand' },
  { id: 'family', label: 'Family-friendly', description: 'Matching looks for all ages' },
];

const productOptions = [
  { id: 'hoodie', label: 'Oversized Hoodie', perks: 'Our best-seller with ultra-soft fleece' },
  { id: 'tee', label: 'Premium Tee', perks: '220gsm organic cotton, buttery soft feel' },
  { id: 'crewneck', label: 'Vintage Crewneck', perks: 'Relaxed fit, 90s inspired silhouette' },
  { id: 'accessory', label: 'Sticker & Poster Pack', perks: 'Perfect as add-on freebies' },
];

export const DesignQuiz = ({ leadEmail, onComplete }: DesignQuizProps) => {
  const [step, setStep] = useState<StepKey>('style');
  const [answers, setAnswers] = useState<QuizAnswers>({
    style: '',
    audience: '',
    productFocus: '',
  });

  const currentOptions = useMemo(() => {
    switch (step) {
      case 'style':
        return styleOptions;
      case 'audience':
        return audienceOptions;
      case 'product':
        return productOptions;
      default:
        return [];
    }
  }, [step]);

  const handleSelect = (id: string) => {
    setAnswers((prev) => ({
      ...prev,
      [step === 'product' ? 'productFocus' : step]: id,
    }));
  };

  const canContinue =
    (step === 'style' && answers.style) ||
    (step === 'audience' && answers.audience) ||
    (step === 'product' && answers.productFocus);

  const goNext = () => {
    if (step === 'style') {
      setStep('audience');
      return;
    }
    if (step === 'audience') {
      setStep('product');
      return;
    }
    onComplete(answers);
  };

  const goBack = () => {
    if (step === 'audience') {
      setStep('style');
      return;
    }
    if (step === 'product') {
      setStep('audience');
      return;
    }
  };

  if (!leadEmail) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#120920] to-[#1a0b2e]" id="design-flow">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto bg-white/10 border border-white/15 backdrop-blur-lg rounded-3xl p-12 shadow-2xl">
            <Sparkles className="w-10 h-10 text-orange-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Start at the top to unlock your guided design quiz
            </h2>
            <p className="text-purple-200">
              Enter your email in the hero section to receive the creator toolkit and continue the flow.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const stepIndex = step === 'style' ? 0 : step === 'audience' ? 1 : 2;

  return (
    <section className="py-20 bg-gradient-to-b from-[#120920] to-[#1a0b2e]" id="design-flow">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-sm mb-4">
            <Wand2 className="w-4 h-4 text-orange-300" />
            Step 2 · Personalise your AI prompt recipe
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let&apos;s Craft Your Creative Direction
          </h2>
          <p className="text-purple-200 max-w-2xl mx-auto">
            We&apos;ll combine your style, audience, and product focus to create tailored prompts and mockups
            (and send them straight to {leadEmail}).
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Style', 'Audience', 'Product'].map((label, index) => (
            <div key={label} className="flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 text-sm font-semibold ${
                  index <= stepIndex
                    ? 'border-orange-400 bg-orange-400/20 text-white'
                    : 'border-purple-500/50 text-purple-300'
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className={`w-16 md:w-24 h-0.5 ${
                    index < stepIndex ? 'bg-orange-400' : 'bg-purple-500/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Option Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {currentOptions.map((option) => {
            const isSelected =
              (step === 'style' && answers.style === option.id) ||
              (step === 'audience' && answers.audience === option.id) ||
              (step === 'product' && answers.productFocus === option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`rounded-3xl border p-6 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-orange-400 bg-orange-500/10 shadow-lg shadow-orange-500/25'
                    : 'border-purple-500/30 bg-purple-900/20 hover:border-orange-400/60 hover:bg-purple-900/40'
                }`}
              >
                <div className="flex items-center gap-3 text-white font-semibold text-lg mb-2">
                  {step === 'style' && <Palette className="w-5 h-5 text-orange-300" />}
                  {step === 'audience' && <Ghost className="w-5 h-5 text-purple-300" />}
                  {step === 'product' && <Sparkles className="w-5 h-5 text-orange-300" />}
                  {option.label}
                </div>
                <p className="text-purple-200">{'description' in option ? option.description : option.perks}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 max-w-4xl mx-auto mt-10">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 'style'}
            className="text-purple-200 hover:text-white hover:bg-white/10"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            {step === 'product' ? 'Show my prompts' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export type { QuizAnswers };
