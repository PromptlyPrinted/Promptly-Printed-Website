'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, Wand2, Ghost, Crown, Palette } from 'lucide-react';

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
    description: 'Launching limited Halloween drops for your audience',
  },
  {
    id: 'parent-partner',
    label: 'Parent / Partner',
    description: 'Coordinating family or couple looks for the big night',
  },
];

interface HeroOfferProps {
  onLeadCaptured: (payload: { email: string; persona: string }) => Promise<void> | void;
  status: 'idle' | 'submitting' | 'error' | 'submitted';
  defaultEmail?: string;
}

export const HeroOffer = ({ onLeadCaptured, status, defaultEmail }: HeroOfferProps) => {
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
          <Ghost className="w-10 h-10 text-purple-300/30" />
        </div>
        <div className="absolute bottom-36 right-16 animate-float">
          <Sparkles className="w-12 h-12 text-orange-300/50" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6 text-sm text-orange-200">
          <Crown className="w-4 h-4" />
          Limited Halloween Creator Experience
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Build Your{' '}
          <span className="bg-gradient-to-r from-orange-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Signature Halloween Drop
          </span>
          <br className="hidden md:block" />
          in One Guided Flow
        </h1>

        <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto mb-10">
          Join the creator community crafting limited-edition Halloween apparel. Unlock pro prompt recipes,
          instant mockups, 10% off your first drop, plus a bonus sticker pack when you complete the flow today.
        </p>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Primary CTA - Quiz */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">
              Find Your Perfect Halloween Design
            </h3>
            <p className="text-purple-200 mb-6">
              Take our 60-second quiz to get personalized product recommendations and a custom AI prompt for your perfect Halloween look.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg text-lg"
              asChild
            >
              <a href="/halloween-2025/quiz">
                <Wand2 className="w-5 h-5 mr-2" />
                Start Quiz (60 seconds)
              </a>
            </Button>
          </div>

          {/* Alternative - Skip to Design */}
          <div className="text-center">
            <p className="text-purple-300 text-sm mb-3">Already know what you want?</p>
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

        <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-purple-300 text-sm">
          <div>🎃 Includes 10% off + free sticker pack</div>
          <div>🔒 No spam—only premium prompt recipes</div>
          <div>⚡ Unlocks guided flow &amp; instant mockups</div>
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
