import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { JsonLd, type WithContext, type Organization, type WebSite, type WebPage, type FAQPage, type HowTo } from '@repo/seo/json-ld';
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
  title: 'AI T-Shirt Design Generator | Create Custom Apparel Online',
  description:
    'Design unique AI-generated t-shirts, hoodies & apparel. Type your idea, our AI creates it. Premium 280gsm fabric. Global shipping. No minimum orders. Create your custom design in minutes.',
};

export const metadata: Metadata = createMetadata({
  ...meta,
  keywords: [
    'AI t-shirt design',
    'custom t-shirt generator',
    'AI apparel design',
    'custom hoodie maker',
    'print on demand AI',
    'AI clothing design',
    'personalized t-shirts',
    'custom printed shirts',
    'AI image to t-shirt',
    'text to t-shirt design',
  ].join(', '),
  alternates: {
    canonical: 'https://promptlyprinted.com',
  },
});

const Home = async () => {
  // Organization Schema - tells Google who you are
  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Promptly Printed',
    url: 'https://promptlyprinted.com',
    logo: 'https://promptlyprinted.com/logo.png',
    description: 'AI-powered custom apparel design platform. Create unique t-shirts, hoodies, and more with artificial intelligence.',
    sameAs: [
      'https://twitter.com/promptlyprinted',
      'https://www.instagram.com/promptlyprinted',
      'https://www.tiktok.com/@promptlyprinted',
      'https://www.facebook.com/promptlyprinted',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@promptlyprinted.com',
    },
    foundingDate: '2024',
    areaServed: 'Worldwide',
  };

  // WebSite Schema with SearchAction - enables sitelinks search box
  const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Promptly Printed',
    url: 'https://promptlyprinted.com',
    description: 'AI-powered custom apparel design and print on demand',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://promptlyprinted.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // WebPage Schema for homepage
  const webPageSchema: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI T-Shirt Design Generator | Promptly Printed',
    description: meta.description,
    url: 'https://promptlyprinted.com',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Promptly Printed',
      url: 'https://promptlyprinted.com',
    },
    about: {
      '@type': 'Thing',
      name: 'AI T-Shirt Design',
      description: 'Custom apparel created using artificial intelligence',
    },
    mainEntity: {
      '@type': 'Service',
      name: 'AI T-Shirt Design Service',
      description: 'Create custom AI-generated designs for t-shirts, hoodies, and apparel',
      provider: {
        '@type': 'Organization',
        name: 'Promptly Printed',
      },
      serviceType: 'Print on Demand',
      areaServed: 'Worldwide',
    },
  };

  // HowTo Schema - Great for appearing in "How to" searches
  const howToSchema: WithContext<HowTo> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create AI-Generated T-Shirt Designs',
    description: 'Learn how to create custom AI-generated t-shirt designs in 5 simple steps',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '25',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Choose Your Apparel',
        text: 'Select from our premium collection of t-shirts, hoodies, and more.',
        url: 'https://promptlyprinted.com/products',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Size and Color',
        text: 'Choose your preferred size, color, and quantity.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose AI Model',
        text: 'Select from multiple AI models optimized for different design styles.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Describe Your Design',
        text: 'Enter a text prompt describing the image you want to create.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Order Your Design',
        text: 'Add to cart and checkout. Your custom apparel ships globally.',
      },
    ],
  };

  // FAQ Schema - Common questions that can appear in search results
  const faqSchema: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does AI t-shirt design work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply type a description of your design idea, and our AI generates a unique image. You can then customize it and print it on premium apparel. The entire process takes just minutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the quality of the printed shirts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We use premium fabric up to 280gsm and professional DTG (Direct to Garment) printing for vibrant, long-lasting prints that won\'t crack or fade.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you ship internationally?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer global shipping to over 100 countries. Shipping times vary by location, typically 5-10 business days.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the minimum order quantity?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'There is no minimum order. You can order a single custom-designed item, making it perfect for personal use or unique gifts.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use my own images?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our Image-to-Image feature lets you upload your own photos and transform them using AI, or you can use Text-to-Image to create entirely new designs from scratch.',
        },
      },
    ],
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <JsonLd code={organizationSchema} />
      <JsonLd code={websiteSchema} />
      <JsonLd code={webPageSchema} />
      <JsonLd code={howToSchema} />
      <JsonLd code={faqSchema} />
      
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
