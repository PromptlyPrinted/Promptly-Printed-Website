import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import { Gift, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'Refer a Friend | Promptly Printed',
  description:
    'Refer your friends to Promptly Printed and earn rewards for both you and your friends.',
});

const benefits = [
  {
    title: 'You Get $10',
    description:
      'Receive a $10 credit for each friend who makes their first purchase.',
  },
  {
    title: 'They Get $10',
    description:
      'Your friends get $10 off their first order when they use your referral link.',
  },
  {
    title: 'Unlimited Rewards',
    description:
      'No limit on how many friends you can refer. The more you share, the more you earn!',
  },
];

export default function ReferFriendPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <Gift className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Refer a Friend
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
            Share the love of custom apparel with your friends and family. When
            they shop, you both get rewarded!
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/auth/login">
              <Mail className="h-5 w-5" />
              Start Referring
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-lg bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="mb-3 font-semibold text-xl">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg bg-muted p-8">
          <h2 className="mb-6 font-semibold text-2xl">How It Works</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                1
              </span>
              <div>
                <h3 className="mb-1 font-semibold">Sign In to Your Account</h3>
                <p className="text-muted-foreground">
                  Log in to access your unique referral link.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                2
              </span>
              <div>
                <h3 className="mb-1 font-semibold">Share Your Link</h3>
                <p className="text-muted-foreground">
                  Send your referral link to friends via email, social media, or
                  messaging.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                3
              </span>
              <div>
                <h3 className="mb-1 font-semibold">Get Rewarded</h3>
                <p className="text-muted-foreground">
                  Earn $10 when your friend makes their first purchase. They get
                  $10 off too!
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
