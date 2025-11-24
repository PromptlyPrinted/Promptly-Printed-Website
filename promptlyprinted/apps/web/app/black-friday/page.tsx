import { createMetadata } from '@repo/seo/metadata';
import { BlackFridayFunnelExperience } from './components/BlackFridayFunnelExperience';

const title = 'Black Friday 2025 - Design Your Custom Apparel & Win $200';
const description = 'Transform your vision into reality with our AI-powered design platform this Black Friday. Create custom hoodies, tees, and one-of-a-kind pieces. Enter our competition to win a $200 cash prize!';

export const metadata = createMetadata({
  title,
  description,
  openGraph: {
    title,
    description,
    images: ['/black-friday-2025-og.jpg'],
  },
  keywords: [
    'black friday custom shirts uk',
    'black friday apparel deals',
    'custom t-shirt design',
    'personalized clothing black friday',
    'ai-designed apparel',
    'custom hoodies black friday',
    'express delivery uk',
    'eco-friendly clothing'
  ],
});

const BlackFridayLandingPage = () => {
  return (
    <BlackFridayFunnelExperience />
  );
};

export default BlackFridayLandingPage;
