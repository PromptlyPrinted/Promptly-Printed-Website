'use client';

import { useCallback, useMemo, useState } from 'react';

import { EnhancedSocialProof } from './EnhancedSocialProof';
import { FinalCTA } from './FinalCTA';
import { HalloweenFAQ } from './HalloweenFAQ';
import { HeroOffer } from './HeroOffer';
import { DesignQuiz, type QuizAnswers } from './DesignQuiz';
import { PromptShowcase } from './PromptShowcase';
import { ProductBundlePreview } from './ProductBundlePreview';
import { LimitedTimeOffer } from './LimitedTimeOffer';
import { CompetitionLeaderboardSection } from './CompetitionLeaderboardSection';

type LeadStatus = 'idle' | 'submitting' | 'error' | 'submitted';

const buildPromptVariants = (answers: QuizAnswers): string[] => {
  const styleDescriptions: Record<string, string> = {
    'retro-ghoul': 'retro horror poster aesthetic, grainy halftone textures, bold distressed typography, 1980s VHS glow',
    'modern-luxe': 'sleek gradient lighting, metallic chrome accents, fashion editorial photography style',
    'dark-fantasy': 'cinematic gothic illustration, misty ambience, dramatic volumetric lighting, ornate details',
    'cartoon-chaos': 'playful cartoon illustration, exaggerated expressions, thick outlines, vibrant candy colour palette',
  };

  const audienceAngles: Record<string, string> = {
    self: 'designed as a single standout piece that looks premium in streetwear lookbooks',
    squad: 'coordinated for a group with complementary variations and space for names or roles',
    customers: 'commercial-ready artwork optimised for ecommerce thumbnails and social promotion',
    family: 'friendly illustration with adjustable elements for adults and kids, inclusive silhouettes',
  };

  const productNotes: Record<string, string> = {
    hoodie: 'oversized heavyweight hoodie mockup, front and back views, premium cotton texture, ribbed cuffs',
    tee: 'unisex premium tee mockup laid flat and on-model, highlight stitching and fabric drape',
    crewneck: 'vintage crewneck mockup with soft fleece interior, relaxed fit, drop shoulder detail',
    accessory: 'sticker sheet and A3 poster mockups, glossy finish, die-cut outlines, layered composition',
  };

  const style = styleDescriptions[answers.style] ?? answers.style;
  const audience = audienceAngles[answers.audience] ?? answers.audience;
  const product = productNotes[answers.productFocus] ?? answers.productFocus;

  return [
    `Halloween concept illustration featuring ${style}. Focus on ${product}. Tailor the design for ${audience}. Include subtle Halloween motifs (pumpkins, ravens, moons) and keep colour palette punchy yet wearable.`,
    `High-impact Halloween streetwear graphic in ${style}. Showcase ${product}. Ensure the composition allows for easy print placement and that typography can be personalised. Appeal to ${audience}.`,
    `Create a Halloween-ready design with ${style}, balanced negative space, and merch mockups for ${product}. Optimise for print clarity, add micro-details for close-up shots, and make it irresistible to ${audience}.`,
  ];
};

export const HalloweenFunnelExperience = () => {
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('idle');
  const [leadInfo, setLeadInfo] = useState<{ email: string; persona: string } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [promptVariants, setPromptVariants] = useState<string[]>([]);
  const [generationsUsed, setGenerationsUsed] = useState(0);

  const handleLeadCaptured = useCallback(
    async ({ email, persona }: { email: string; persona: string }) => {
      try {
        setLeadStatus('submitting');
        const response = await fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            campaignId: 'halloween-2025',
            trigger: 'manual',
            metadata: {
              persona,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Lead capture failed (${response.status})`);
        }

        setLeadInfo({ email, persona });
        setLeadStatus('submitted');
      } catch (error) {
        console.error('Lead capture error:', error);
        setLeadStatus('error');
      }
    },
    []
  );

  const handleQuizComplete = useCallback(
    (answers: QuizAnswers) => {
      setQuizAnswers(answers);
      setPromptVariants(buildPromptVariants(answers));
      setGenerationsUsed(1);
    },
    []
  );

  const handleGenerateAnother = useCallback(() => {
    if (!quizAnswers) return;
    if (generationsUsed >= 1) {
      return;
    }

    setPromptVariants(buildPromptVariants(quizAnswers));
    setGenerationsUsed((current) => current + 1);
  }, [quizAnswers, generationsUsed]);

  const showUnlockBanner = useMemo(() => generationsUsed >= 1, [generationsUsed]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#06070a] relative overflow-hidden">
      <HeroOffer onLeadCaptured={handleLeadCaptured} status={leadStatus} defaultEmail={leadInfo?.email} />

      <DesignQuiz leadEmail={leadInfo?.email} onComplete={handleQuizComplete} />

      <PromptShowcase
        answers={quizAnswers}
        prompts={promptVariants}
        showUnlockMessage={showUnlockBanner}
        onGenerateAnother={handleGenerateAnother}
      />

      <ProductBundlePreview />

      <LimitedTimeOffer />

      <CompetitionLeaderboardSection />

      <EnhancedSocialProof />

      <HalloweenFAQ />

      <FinalCTA />
    </div>
  );
};
