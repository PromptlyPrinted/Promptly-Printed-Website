import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Gift, Mail } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'Refer a Friend | Promptly Printed',
  description: 'Refer your friends to Promptly Printed and earn rewards for both you and your friends.',
});

const benefits = [
  {
    title: 'You Get $10',
    description: 'Receive a $10 credit for each friend who makes their first purchase.',
  },
  {
    title: 'They Get $10',
    description: 'Your friends get $10 off their first order when they use your referral link.',
  },
  {
    title: 'Unlimited Rewards',
    description: 'No limit on how many friends you can refer. The more you share, the more you earn!',
  },
];

export default function ReferFriendPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Gift className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Refer a Friend</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Share the love of custom apparel with your friends and family.
            When they shop, you both get rewarded!
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/auth/login">
              <Mail className="w-5 h-5" />
              Start Referring
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</span>
              <div>
                <h3 className="font-semibold mb-1">Sign In to Your Account</h3>
                <p className="text-muted-foreground">Log in to access your unique referral link.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</span>
              <div>
                <h3 className="font-semibold mb-1">Share Your Link</h3>
                <p className="text-muted-foreground">Send your referral link to friends via email, social media, or messaging.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</span>
              <div>
                <h3 className="font-semibold mb-1">Get Rewarded</h3>
                <p className="text-muted-foreground">Earn $10 when your friend makes their first purchase. They get $10 off too!</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
} 