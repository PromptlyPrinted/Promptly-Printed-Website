import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Button } from '@repo/design-system/components/ui/button';

export const metadata: Metadata = createMetadata({
  title: 'Affiliate Program | Promptly Printed',
  description: 'Join our affiliate program and earn rewards for sharing Promptly Printed.',
});

export default function AffiliatePage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Affiliate Program</h1>
        
        <div className="bg-card rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Join Our Affiliate Program</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Partner with us and earn commission for every successful referral.
            Our affiliate program offers competitive rates and dedicated support
            to help you succeed.
          </p>
          
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Competitive Commission</h3>
                <p className="text-sm text-muted-foreground">
                  Earn up to 20% commission on each sale
                </p>
              </div>
            </div>
          </div>

          <Button className="mt-8" size="lg">
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
} 