'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, Wand2, Trophy, Gift, Snowflake } from 'lucide-react';

type PersonaOption = {
  id: string;
  label: string;
  description: string;
};

const personas: PersonaOption[] = [
  {
    id: 'trendsetter',
    label: 'Style Creator',
    description: 'Designing festive looks for yourself or your crew',
  },
  {
    id: 'brand-owner',
    label: 'Brand Owner',
    description: 'Launching limited Christmas drops for your audience',
  },
  {
    id: 'gift-shopper',
    label: 'Gift Giver',
    description: 'Creating magical personalized gifts this holiday season',
  },
];

interface ChristmasHeroProps {
  onLeadCaptured: (payload: { email: string; persona: string }) => Promise<void> | void;
  status: 'idle' | 'submitting' | 'error' | 'submitted';
  defaultEmail?: string;
}

export const ChristmasHero = ({ onLeadCaptured, status, defaultEmail }: ChristmasHeroProps) => {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [selectedPersona, setSelectedPersona] = useState<string>('trendsetter');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    await onLeadCaptured({ email, persona: selectedPersona });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden z-10">
      {/* Animated Background - Christmas themed */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-pulse">
          <Snowflake className="w-10 h-10 text-blue-300/30" />
        </div>
        <div className="absolute bottom-36 right-16 animate-float">
          <Sparkles className="w-12 h-12 text-red-400/50" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <Gift className="w-10 h-10 text-green-300/30" />
        </div>
        <div className="absolute top-60 left-24 animate-float animation-delay-2000">
          <Snowflake className="w-8 h-8 text-white/20" />
        </div>
        <div className="absolute bottom-20 left-40 animate-pulse animation-delay-1000">
          <Trophy className="w-10 h-10 text-yellow-300/40" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6 text-sm text-red-200">
          <Gift className="w-4 h-4" />
          🎁 Up to 50% Off + Win $500 USD Cash Prize
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Create Your{' '}
          <span className="bg-gradient-to-r from-red-400 via-green-500 to-red-500 bg-clip-text text-transparent">
            Magical Christmas Design
          </span>
          <br className="hidden md:block" />
          & Win $500 USD
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Join our festive creator community! Design custom Christmas apparel with AI, share your style,
          and compete for our biggest prize yet - $500 USD cash. Competition runs through December 31st.
        </p>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Primary CTA - Quiz */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">
              Take the Quiz & Enter to Win $500
            </h3>
            <p className="text-gray-300 mb-6">
              Take our 60-second style quiz to get personalized recommendations and automatically enter our $500 USD cash prize competition!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-500 via-green-600 to-red-600 hover:from-red-600 hover:via-green-700 hover:to-red-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg text-lg"
              asChild
            >
              <a href="/christmas-2025/quiz">
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
              <a href="#design-flow">
                Skip to Design →
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm">
            <div>🎄 $500 USD Prize - Ends Dec 31st</div>
            <div>🎨 AI-Powered Design Tools</div>
            <div>⚡ Express Delivery Available</div>
          </div>
          <p className="text-xs text-gray-500 text-center max-w-md">
            *Competition entry requires purchase. Points awarded for likes, wearing photos, and social follows. Full rules below.
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
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};
