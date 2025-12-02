import { createMetadata } from '@repo/seo/metadata';
import { ChristmasFunnelExperience } from './components/ChristmasFunnelExperience';

const title = 'Christmas 2025 - Design Your Custom Apparel & Win $500 USD';
const description = 'Transform your festive vision into reality with our AI-powered design platform this Christmas. Create custom hoodies, tees, and one-of-a-kind pieces. Enter our competition to win a $500 USD cash prize!';

export const metadata = createMetadata({
  title,
  description,
  openGraph: {
    title,
    description,
    images: ['/christmas-2025-og.jpg'],
  },
  keywords: [
    'custom christmas shirts uk',
    'christmas apparel deals',
    'custom t-shirt design',
    'personalized christmas clothing',
    'ai-designed apparel',
    'custom christmas hoodies',
    'express delivery uk',
    'eco-friendly clothing',
    'christmas gifts uk',
    'festive clothing'
  ],
});

const ChristmasLandingPage = () => {
  return (
    <ChristmasFunnelExperience />
  );
};

export default ChristmasLandingPage;
