import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Button } from '@repo/design-system/components/ui/button';
import { Store } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'Etsy Store | Promptly Printed',
  description: 'Shop our collection on Etsy for unique, custom-printed apparel and accessories.',
});

export default function EtsyStorePage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-3xl mx-auto text-center">
        <Store className="w-16 h-16 mx-auto mb-6 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Etsy Store</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover our full collection of custom-printed apparel and accessories on Etsy.
          We offer unique designs and personalized items for every occasion.
        </p>
        <Button size="lg" asChild>
          <Link href="https://www.etsy.com/shop/promptlyprinted" target="_blank" rel="noopener noreferrer">
            Visit Our Etsy Store
          </Link>
        </Button>
      </div>
    </div>
  );
} 