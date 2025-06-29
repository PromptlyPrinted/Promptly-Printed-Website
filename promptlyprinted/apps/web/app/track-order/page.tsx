import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { createMetadata } from '@repo/seo/metadata';
import { Package } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Track Order | Promptly Printed',
  description:
    'Track your Promptly Printed order status and shipping information.',
});

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-xl">
        <div className="mb-12 text-center">
          <Package className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-xl">
            Enter your order number to check the status of your order and view
            shipping information.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="orderNumber"
              className="mb-2 block font-medium text-foreground text-sm"
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
              className="mb-2 block font-medium text-foreground text-sm"
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

        <div className="mt-12 rounded-lg bg-muted p-6">
          <h2 className="mb-4 font-semibold text-lg">Need Help?</h2>
          <p className="mb-4 text-muted-foreground">
            Can't find your order number? Check your order confirmation email or
            contact our customer support team for assistance.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <a href="mailto:support@promptlyprinted.com">Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
