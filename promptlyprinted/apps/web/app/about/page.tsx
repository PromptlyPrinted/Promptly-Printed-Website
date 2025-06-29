import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'About Us | Promptly Printed',
  description: 'Learn about our mission and story at Promptly Printed.',
});

export default function AboutPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-bold text-4xl tracking-tight">About Us</h1>
        <div className="prose prose-lg">
          <p className="text-lg text-muted-foreground leading-relaxed">
            At Promptly Printed, we believe in making custom apparel accessible
            to everyone. Our platform combines cutting-edge design tools with
            high-quality printing to bring your creative visions to life.
          </p>

          <h2 className="mt-12 mb-4 font-semibold text-2xl">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're dedicated to providing a seamless experience for creating
            custom apparel, whether you're an individual looking for a unique
            piece or a business needing branded merchandise.
          </p>
        </div>
      </div>
    </div>
  );
}
