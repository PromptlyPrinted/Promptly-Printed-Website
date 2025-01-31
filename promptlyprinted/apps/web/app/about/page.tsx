import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'About Us | Promptly Printed',
  description: 'Learn about our mission and story at Promptly Printed.',
});

export default function AboutPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About Us</h1>
        <div className="prose prose-lg">
          <p className="text-lg text-muted-foreground leading-relaxed">
            At Promptly Printed, we believe in making custom apparel accessible to everyone.
            Our platform combines cutting-edge design tools with high-quality printing
            to bring your creative visions to life.
          </p>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're dedicated to providing a seamless experience for creating custom apparel,
            whether you're an individual looking for a unique piece or a business
            needing branded merchandise.
          </p>
        </div>
      </div>
    </div>
  );
} 