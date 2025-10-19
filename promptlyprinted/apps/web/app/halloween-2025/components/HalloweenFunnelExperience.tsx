'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

import { EnhancedSocialProof } from './EnhancedSocialProof';
import { FinalCTA } from './FinalCTA';
import { HalloweenFAQ } from './HalloweenFAQ';
import { HeroOffer } from './HeroOffer';
import { ProductBundlePreview } from './ProductBundlePreview';
import { LimitedTimeOffer } from './LimitedTimeOffer';
import { CompetitionLeaderboardSection } from './CompetitionLeaderboardSection';

type LeadStatus = 'idle' | 'submitting' | 'error' | 'submitted';

export const HalloweenFunnelExperience = () => {
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('idle');
  const [leadInfo, setLeadInfo] = useState<{ email: string; persona: string } | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#06070a] relative overflow-hidden">
      <HeroOffer onLeadCaptured={handleLeadCaptured} status={leadStatus} defaultEmail={leadInfo?.email} />

      {/* Quiz Section - Navigate to dedicated quiz page */}
      <section className="py-20 bg-gradient-to-b from-[#120920] to-[#1a0b2e]" id="design-flow">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-sm mb-4">
              <Sparkles className="w-4 h-4 text-orange-300" />
              Step 2 · Discover Your Perfect Halloween Style
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Take the Halloween Style Quiz
            </h2>
            <p className="text-purple-200 mb-8">
              Answer a few quick questions to get personalized Halloween apparel recommendations tailored just for you.
            </p>
            <Link href="/halloween-2025/quiz">
              <Button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg flex items-center gap-2 mx-auto text-lg">
                Start Quiz
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ProductBundlePreview />

      <LimitedTimeOffer />

      <CompetitionLeaderboardSection />

      <EnhancedSocialProof />

      <HalloweenFAQ />

      <FinalCTA />
    </div>
  );
};
