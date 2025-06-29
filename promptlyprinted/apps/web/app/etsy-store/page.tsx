import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import { Store } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'Etsy Store | Promptly Printed',
  description:
    'Shop our collection on Etsy for unique, custom-printed apparel and accessories.',
});

export default function EtsyStorePage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-3xl text-center">
        <Store className="mx-auto mb-6 h-16 w-16 text-primary" />
        <h1 className="mb-4 font-bold text-4xl tracking-tight">
          Our Etsy Store
        </h1>
        <p className="mb-8 text-muted-foreground text-xl">
          Discover our full collection of custom-printed apparel and accessories
          on Etsy. We offer unique designs and personalized items for every
          occasion.
        </p>
        <Button size="lg" asChild>
          <Link
            href="https://www.etsy.com/shop/promptlyprinted"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Our Etsy Store
          </Link>
        </Button>
      </div>
    </div>
  );
}
