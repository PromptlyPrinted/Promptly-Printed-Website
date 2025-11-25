'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, Wand2, Trophy, Crown, Zap } from 'lucide-react';

type PersonaOption = {
  id: string;
  label: string;
  description: string;
};

const personas: PersonaOption[] = [
  {
    id: 'trendsetter',
    label: 'Trendsetting Creator',
    description: 'Designing for yourself or your squad with viral styles',
  },
  {
    id: 'brand-owner',
    label: 'Brand Owner',
    description: 'Launching limited Black Friday drops for your audience',
  },
  {
    id: 'gift-shopper',
    label: 'Gift Shopper',
    description: 'Creating unique personalized gifts this holiday season',
  },
];

interface BlackFridayHeroProps {
  onLeadCaptured: (payload: { email: string; persona: string }) => Promise<void> | void;
  status: 'idle' | 'submitting' | 'error' | 'submitted';
  defaultEmail?: string;
}

export const BlackFridayHero = ({ onLeadCaptured, status, defaultEmail }: BlackFridayHeroProps) => {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [selectedPersona, setSelectedPersona] = useState<string>('trendsetter');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    await onLeadCaptured({ email, persona: selectedPersona });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden z-10">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-pulse">
          <Zap className="w-10 h-10 text-yellow-300/30" />
        </div>
        <div className="absolute bottom-36 right-16 animate-float">
          <Sparkles className="w-12 h-12 text-yellow-400/50" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <Trophy className="w-10 h-10 text-red-300/30" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6 text-sm text-yellow-200">
          <Crown className="w-4 h-4" />
          Black Friday Special - Win $200 Cash Prize
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Create Your{' '}
          <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
            Custom Black Friday Drop
          </span>
          <br className="hidden md:block" />
          & Enter to Win $200
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Join our Black Friday creator community! Design custom apparel with AI, unlock exclusive deals,
          and enter our competition for a chance to win $200 cash. Competition ends November 29th.
        </p>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Primary CTA - Quiz */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">
              Take the Quiz & Enter to Win $200
            </h3>
            <p className="text-gray-300 mb-6">
              Take our 60-second style quiz to get personalized recommendations and automatically enter our $200 cash prize competition!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg text-lg"
              asChild
            >
              <a href="/black-friday/quiz">
                <Wand2 className="w-5 h-5 mr-2" />
                Start Quiz & Enter (60 seconds)
              </a>
            </Button>
          </div>

          {/* Alternative - Skip to Design */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">Already know what you want?</p>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/5 hover:bg-white/10 text-white px-6 py-4"
              asChild
            >
              <a href="#bundle-offer">
                Skip to Products →
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm">
            <div>🏆 $200 Cash Prize - Ends Nov 29th</div>
            <div>🎨 AI-Powered Design Tools</div>
            <div>⚡ Express Delivery Available</div>
          </div>
          <p className="text-xs text-gray-500 text-center max-w-md">
            *Competition entry only valid with purchase. Buy a t-shirt to enter the $200 prize draw.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
