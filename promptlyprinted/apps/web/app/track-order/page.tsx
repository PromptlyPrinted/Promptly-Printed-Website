import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Package } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';

export const metadata: Metadata = createMetadata({
  title: 'Track Order | Promptly Printed',
  description: 'Track your Promptly Printed order status and shipping information.',
});

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <Package className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
          <p className="text-xl text-muted-foreground">
            Enter your order number to check the status of your order
            and view shipping information.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="orderNumber"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Order Number
            </label>
            <Input
              id="orderNumber"
              name="orderNumber"
              type="text"
              placeholder="Enter your order number (e.g., PP-123456)"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter the email used for your order"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Track Order
          </Button>
        </form>

        <div className="mt-12 bg-muted rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            Can't find your order number? Check your order confirmation email
            or contact our customer support team for assistance.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <a href="mailto:support@promptlyprinted.com">
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
} 