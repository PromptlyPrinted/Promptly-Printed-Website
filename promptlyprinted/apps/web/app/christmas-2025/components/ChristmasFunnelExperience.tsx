'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

import { EnhancedSocialProof } from '../../halloween-2025/components/EnhancedSocialProof';
import { FinalCTA } from '../../halloween-2025/components/FinalCTA';
import { HalloweenFAQ } from '../../halloween-2025/components/HalloweenFAQ';
import { CompetitionLeaderboardSection } from '../../halloween-2025/components/CompetitionLeaderboardSection';
import { ChristmasHero } from './ChristmasHero';

type LeadStatus = 'idle' | 'submitting' | 'error' | 'submitted';

export const ChristmasFunnelExperience = () => {
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
            campaignId: 'christmas-2025',
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a0a] via-[#1a0a0a] to-[#0a0a1a] relative overflow-hidden">
      <ChristmasHero onLeadCaptured={handleLeadCaptured} status={leadStatus} defaultEmail={leadInfo?.email} />

      {/* Quiz Section - Navigate to dedicated quiz page */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a1a] to-[#1a0a0a]" id="design-flow">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-900/40 border border-red-500/30 text-red-200 text-sm mb-4">
              <Sparkles className="w-4 h-4 text-red-300" />
              Step 2 · Discover Your Perfect Style & Win $500
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Take the Christmas Style Quiz
            </h2>
            <p className="text-gray-300 mb-6">
              Answer a few quick questions to get personalized apparel recommendations and enter our competition to win $500 USD cash!
            </p>
            <p className="text-red-400 text-sm mb-8">
              *Competition entry requires purchase. Earn points through likes, wearing photos, and social follows. Competition ends December 31st.
            </p>
            <Link href="/christmas-2025/quiz">
              <Button className="bg-gradient-to-r from-red-500 via-green-600 to-red-600 hover:from-red-600 hover:via-green-700 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg flex items-center gap-2 mx-auto text-lg">
                Start Quiz & Enter Competition
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Competition Rules Section */}
      <section className="py-20 bg-gradient-to-b from-[#1a0a0a] to-[#0a1a0a]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              How to Win $500 USD
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Entry Requirement */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="text-xl font-bold text-white mb-2">1. Complete Your Purchase</h3>
                <p className="text-gray-300">
                  Design and purchase your custom Christmas apparel to enter the competition. No purchase = no entry.
                </p>
              </div>

              {/* Likes */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">❤️</div>
                <h3 className="text-xl font-bold text-white mb-2">2. Get Likes (5 points each)</h3>
                <p className="text-gray-300">
                  Share your design and get the community to like it. Each like = 5 points toward the prize.
                </p>
              </div>

              {/* Wearing Photo */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">📸</div>
                <h3 className="text-xl font-bold text-white mb-2">3. Upload Wearing Photo (100 points)</h3>
                <p className="text-gray-300">
                  Submit a photo of yourself wearing your design for a massive 100-point bonus!
                </p>
              </div>

              {/* Social Follow */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="text-xl font-bold text-white mb-2">4. Follow Us (50 bonus points)</h3>
                <p className="text-gray-300">
                  Follow Promptly Printed on social media for an easy 50-point boost to your score!
                </p>
              </div>
            </div>

            <div className="mt-10 bg-gradient-to-r from-red-500/10 to-green-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
              <p className="text-white font-semibold text-lg mb-2">
                Winner Announced: January 5th, 2026
              </p>
              <p className="text-gray-300 text-sm">
                The participant with the most points wins $500 USD cash, transferred directly to your account. Good luck!
              </p>
            </div>
          </div>
        </div>
      </section>

      <CompetitionLeaderboardSection />

      <EnhancedSocialProof />

      <HalloweenFAQ />

      <FinalCTA />
    </div>
  );
};
