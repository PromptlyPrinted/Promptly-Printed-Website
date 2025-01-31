import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Button } from '@repo/design-system/components/ui/button';

export const metadata: Metadata = createMetadata({
  title: 'Design Your Apparel | Promptly Printed',
  description: 'Create your custom apparel with our easy-to-use design tool.',
});

export default function DesignPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Design Your Apparel</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create unique, custom-designed apparel with our intuitive design tool.
          Choose from a variety of products and make them truly yours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Product categories for design will go here */}
        <div className="bg-card rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-muted rounded-lg mb-4">
            {/* Product image placeholder */}
          </div>
          <h3 className="text-xl font-semibold mb-2">T-Shirts</h3>
          <p className="text-muted-foreground mb-4">
            Design custom t-shirts for any occasion
          </p>
          <Button variant="outline" className="w-full">
            Start Designing
          </Button>
        </div>
      </div>
    </div>
  );
} 