import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Hero } from './components/hero';
import { HowItWorks } from './components/how-it-works';
import { Showcase } from './components/showcase';
import { WhyDifferent } from './components/why-different';
import { Craftsmanship } from './components/craftsmanship';
import { SocialProof } from './components/social-proof';
import { PricingOffer } from './components/pricing-offer';
import { BrandStory } from './components/brand-story';
import { FinalCTA } from './components/final-cta';

const meta = {
  title: 'Design Your Own Premium Apparel with AI | Promptly Printed',
  description:
    'Type an idea. Watch it become wearable art. Create custom AI-generated designs on premium fabric up to 280gsm. Global shipping. One-of-one exclusivity.',
};

export const metadata: Metadata = createMetadata(meta);

const Home = async () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Showcase />
      <WhyDifferent />
      <Craftsmanship />
      <SocialProof />
      <PricingOffer />
      <BrandStory />
      <FinalCTA />
    </>
  );
};

export default Home;
