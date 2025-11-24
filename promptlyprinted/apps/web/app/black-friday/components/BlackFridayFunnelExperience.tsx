'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

import { EnhancedSocialProof } from '../../halloween-2025/components/EnhancedSocialProof';
import { FinalCTA } from '../../halloween-2025/components/FinalCTA';
import { HalloweenFAQ } from '../../halloween-2025/components/HalloweenFAQ';
import { ProductBundlePreview } from '../../halloween-2025/components/ProductBundlePreview';
import { LimitedTimeOffer } from '../../halloween-2025/components/LimitedTimeOffer';
import { CompetitionLeaderboardSection } from '../../halloween-2025/components/CompetitionLeaderboardSection';
import { BlackFridayHero } from './BlackFridayHero';

type LeadStatus = 'idle' | 'submitting' | 'error' | 'submitted';

export const BlackFridayFunnelExperience = () => {
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
            campaignId: 'black-friday-2025',
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] relative overflow-hidden">
      <BlackFridayHero onLeadCaptured={handleLeadCaptured} status={leadStatus} defaultEmail={leadInfo?.email} />

      {/* Quiz Section - Navigate to dedicated quiz page */}
      <section className="py-20 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" id="design-flow">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900/40 border border-yellow-500/30 text-yellow-200 text-sm mb-4">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Step 2 · Discover Your Perfect Style & Win $200
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Take the Black Friday Style Quiz
            </h2>
            <p className="text-gray-300 mb-8">
              Answer a few quick questions to get personalized apparel recommendations and enter our competition to win $200 cash!
            </p>
            <Link href="/black-friday/quiz">
              <Button className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg flex items-center gap-2 mx-auto text-lg">
                Start Quiz & Enter Competition
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
