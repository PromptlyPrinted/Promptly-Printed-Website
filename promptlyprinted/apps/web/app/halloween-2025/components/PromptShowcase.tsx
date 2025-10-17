'use client';

import { useMemo } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, Stars, Wand2, Lock } from 'lucide-react';
import Image from 'next/image';
import type { QuizAnswers } from './DesignQuiz';

interface PromptShowcaseProps {
  answers: QuizAnswers | null;
  prompts: string[];
  showUnlockMessage: boolean;
  onGenerateAnother: () => void;
}

export const PromptShowcase = ({
  answers,
  prompts,
  showUnlockMessage,
  onGenerateAnother,
}: PromptShowcaseProps) => {
  const previewCopy = useMemo(() => {
    if (!answers) return 'Complete the guided quiz to see your tailored prompts.';

    const styleLabel = answers.style.replace(/-/g, ' ');
    const audienceLabel = answers.audience.replace(/-/g, ' ');
    const productLabel = answers.productFocus.replace(/-/g, ' ');

    return `You chose a ${styleLabel} vibe for ${audienceLabel}. Here’s how it could look on our ${productLabel}.`;
  }, [answers]);

  return (
    <section className="py-20 bg-gradient-to-b from-[#1a0b2e] to-[#0f1419]" id="prompt-results">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-200 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Step 3 · Review your AI prompt & mockup blueprint
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Creative Blueprint is Ready
          </h2>
          <p className="text-purple-200 max-w-3xl mx-auto">
            Use these prompts inside the AI studio or share them with your team. Launch the studio to turn them into
            shoppable products in minutes.
          </p>
        </div>

        {answers ? (
          <div className="grid lg:grid-cols-[2fr,1fr] gap-10 max-w-6xl mx-auto">
            <div className="space-y-6">
              {prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="bg-purple-900/30 border border-purple-600/30 rounded-3xl p-6 backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 text-orange-300 font-semibold mb-2">
                    <Stars className="w-4 h-4" />
                    Prompt #{index + 1}
                  </div>
                  <p className="text-purple-100 leading-relaxed whitespace-pre-line">{prompt}</p>
                </div>
              ))}

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
                  onClick={() => window.open('/design/halloween', '_self')}
                >
                  <Wand2 className="w-5 h-5" />
                  Launch AI Studio
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onGenerateAnother}
                  className="border-orange-400 text-orange-200 hover:bg-orange-500/10"
                  disabled={showUnlockMessage}
                >
                  Generate another variation
                </Button>
                {showUnlockMessage && (
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-purple-200 hover:text-white"
                    onClick={() => window.open('/sign-up?redirect=/design/halloween', '_self')}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Create a free account to unlock unlimited prompts
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur-md">
              <div className="mb-6 text-sm text-purple-200 leading-relaxed">{previewCopy}</div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-purple-500/20">
                <Image
                  src="/lora-images/retro-futurism.png"
                  alt="Halloween hoodie mockup"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-purple-900/30 border border-purple-500/30 text-sm text-purple-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Instant mockups ready in <strong>under 30 seconds</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full" />
                  Shareable prompt card delivered to your inbox
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full" />
                  Save to your creator profile with one tap
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-purple-900/30 border border-purple-600/40 rounded-3xl p-12 text-center text-purple-200">
            Complete the guided quiz above to unlock your tailored prompts and mockup preview.
          </div>
        )}
      </div>
    </section>
  );
};
