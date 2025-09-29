'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card } from '@repo/design-system/components/ui/card';
import Link from 'next/link';
import { useCampaign } from '@/hooks/useCampaign';
import { type Campaign } from '@/lib/campaigns';
import { LeadCaptureModal } from '@/components/lead-capture/LeadCaptureModal';

interface CampaignLandingPageProps {
  campaign: Campaign;
  utmParams: {
    utm_source?: string;
    utm_medium?: string;
    utm_content?: string;
  };
}

export function CampaignLandingPage({ campaign, utmParams }: CampaignLandingPageProps) {
  const { trackCampaignEvent } = useCampaign();
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [visitorsCount, setVisitorsCount] = useState(0);

  useEffect(() => {
    // Track landing page view
    trackCampaignEvent('campaign_landing_viewed', {
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_content: utmParams.utm_content,
    });

    // Simulate live visitor counter
    setVisitorsCount(Math.floor(Math.random() * 50) + 20);

    // Show lead capture after 30 seconds
    const timer = setTimeout(() => {
      setShowLeadCapture(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleCTAClick = () => {
    trackCampaignEvent('campaign_cta_clicked', {
      cta_text: campaign.copy.cta,
      utm_source: utmParams.utm_source,
    });
  };

  const campaignStyles = {
    background: `linear-gradient(135deg, ${campaign.colors.primary}20, ${campaign.colors.secondary}20)`,
    '--primary': campaign.colors.primary,
    '--secondary': campaign.colors.secondary,
    '--accent': campaign.colors.accent,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen" style={campaignStyles}>
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Social Proof Banner */}
          <div className="mb-8">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/90 text-gray-800"
            >
              🔥 {visitorsCount} people designing right now in your area
            </Badge>
          </div>

          {/* Main Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{ color: campaign.colors.accent }}
          >
            {campaign.copy.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {campaign.copy.subheadline}
          </p>

          {/* Discount Badge */}
          {campaign.discounts && (
            <div className="mb-8">
              <Badge
                className="text-lg py-2 px-4 mb-4"
                style={{
                  backgroundColor: campaign.colors.primary,
                  color: 'white'
                }}
              >
                {campaign.discounts.percentage}% OFF - Code: {campaign.discounts.code}
              </Badge>
            </div>
          )}

          {/* CTA Button */}
          <div className="space-y-4">
            <Button
              asChild
              size="lg"
              className="text-xl py-6 px-12 rounded-full shadow-lg hover:scale-105 transition-transform"
              style={{
                backgroundColor: campaign.colors.primary,
                borderColor: campaign.colors.primary,
              }}
              onClick={handleCTAClick}
            >
              <Link href={`/design/TEE-SS-STTU755?utm_campaign=${campaign.id}&utm_source=${utmParams.utm_source || ''}`}>
                {campaign.copy.cta} →
              </Link>
            </Button>

            <p className="text-sm text-gray-500">
              No account required • Start designing in 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: campaign.colors.primary }}
              >
                1
              </div>
              <h3 className="font-semibold mb-2">Describe Your Vision</h3>
              <p className="text-gray-600">Tell our AI what you want to create</p>
            </Card>

            <Card className="p-6 text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: campaign.colors.secondary }}
              >
                2
              </div>
              <h3 className="font-semibold mb-2">AI Creates Magic</h3>
              <p className="text-gray-600">Watch your design come to life instantly</p>
            </Card>

            <Card className="p-6 text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: campaign.colors.accent }}
              >
                3
              </div>
              <h3 className="font-semibold mb-2">Wear Your Creation</h3>
              <p className="text-gray-600">Fast delivery to your door</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Gallery */}
      <section className="py-16 px-4" style={{ backgroundColor: `${campaign.colors.primary}10` }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Join Thousands of Happy Creators</h2>

          {/* Placeholder for customer gallery */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-md">
                <div className="w-full h-48 bg-gray-200 rounded-md mb-3"></div>
                <p className="text-sm text-gray-600">"Amazing quality!"</p>
                <p className="text-xs text-gray-500">- Customer {i}</p>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            variant="outline"
            className="border-2"
            style={{
              borderColor: campaign.colors.primary,
              color: campaign.colors.primary
            }}
            onClick={handleCTAClick}
          >
            <Link href={`/design/TEE-SS-STTU755?utm_campaign=${campaign.id}&utm_source=${utmParams.utm_source || ''}`}>
              Start Creating Your Design
            </Link>
          </Button>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        campaign={campaign}
        utmSource={utmParams.utm_source}
      />
    </div>
  );
}