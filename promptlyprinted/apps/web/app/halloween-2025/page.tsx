import { createMetadata } from '@repo/seo/metadata';
import { HalloweenFunnelExperience } from './components/HalloweenFunnelExperience';

const title = 'Halloween 2025 - Create Your Hauntingly Unique Look';
const description = 'Transform your Halloween vision into reality with our AI-powered design platform. Create wickedly wonderful hoodies, perfectly petrifying tees, and one-of-a-kind pieces that guarantee you\'ll be the talk of every Halloween gathering.';

export const metadata = createMetadata({
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
});

const HalloweenLandingPage = () => {
  return (
    <HalloweenFunnelExperience />
  );
};

export default HalloweenLandingPage;
