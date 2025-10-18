import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'About Us - Custom Apparel & AI-Powered Design | Promptly Printed',
  description: 'Discover how Promptly Printed revolutionizes custom apparel with AI-powered design tools. Learn about our mission to make high-quality custom printing accessible to everyone.',
  keywords: [
    'custom apparel',
    'AI design tools',
    'custom t-shirt printing',
    'print on demand',
    'custom merchandise',
    'personalized apparel',
    'AI-powered printing',
    'custom clothing online',
    'sustainable printing',
    'custom brand merchandise'
  ],
  openGraph: {
    title: 'About Promptly Printed - Where Creativity Meets Custom Craftsmanship',
    description: 'Transform your ideas into wearable art with AI-powered design tools and premium custom printing. Join thousands of creators worldwide.',
    type: 'website',
  },
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
