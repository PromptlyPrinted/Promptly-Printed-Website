import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HalloweenHero } from './components/HalloweenHero';
import { PhantomPointsTracker } from './components/PhantomPointsTracker';
import { HowItWorks } from './components/HowItWorks';
import { SocialProof } from './components/SocialProof';
import { ProductShowcase } from './components/ProductShowcase';
import { SustainabilityMessage } from './components/SustainabilityMessage';
import { UrgencyElements } from './components/UrgencyElements';
import { FinalCTA } from './components/FinalCTA';
import { HalloweenTracker } from './components/HalloweenTracker';
import { SpookyFloatingElements } from './components/SpookyFloatingElements';

const title = 'Halloween 2025 - Create Your Hauntingly Unique Look | Promptly Printed';
const description = 'Transform your Halloween vision into reality with our AI-powered design platform. Create wickedly wonderful hoodies, perfectly petrifying tees, and one-of-a-kind pieces that guarantee you\'ll be the talk of every Halloween gathering.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: ['/halloween-2025-og.jpg'],
  },
  keywords: [
    'custom halloween shirt uk',
    'halloween t-shirt design',
    'personalized halloween clothing',
    'ai-designed halloween apparel',
    'custom halloween hoodies',
    'unique halloween costumes',
    'express halloween delivery',
    'eco-friendly halloween clothing'
  ],
};

const HalloweenLandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#16213e] relative overflow-hidden">
      {/* Spooky Floating Elements */}
      <SpookyFloatingElements />

      {/* Halloween Analytics Tracking */}
      <Suspense fallback={null}>
        <HalloweenTracker />
      </Suspense>

      {/* Phantom Points Tracker - Sticky */}
      <PhantomPointsTracker />

      {/* Hero Section */}
      <HalloweenHero />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Product Showcase Grid */}
      <ProductShowcase />

      {/* Sustainability Message */}
      <SustainabilityMessage />

      {/* Urgency & Scarcity Elements */}
      <UrgencyElements />

      {/* Final CTA Section */}
      <FinalCTA />
    </div>
  );
};

export default HalloweenLandingPage;