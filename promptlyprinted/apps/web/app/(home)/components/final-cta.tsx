import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight, Shield, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const FinalCTA = () => {
  const trustBadges = [
    {
      icon: Shield,
      label: 'Satisfaction Guaranteed',
    },
    {
      icon: Truck,
      label: 'Free Worldwide Shipping',
    },
    {
      icon: RefreshCw,
      label: 'Easy Returns',
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-[#0D2C45] via-[#0D2C45] to-[#16C1A8]/20 py-20 lg:py-32 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#16C1A8] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FF8A26] rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-12 text-center">
          {/* Main Content */}
          <div className="flex flex-col items-center gap-6 max-w-4xl">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight">
              Your imagination deserves to be worn
            </h2>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl">
              Join thousands of creators bringing their ideas to life with AI-powered custom apparel.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button
              size="lg"
              className="gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white text-lg px-10 py-7 h-auto shadow-xl shadow-[#16C1A8]/25 transition-all hover:scale-105"
              asChild
            >
              <Link href="/designs">
                Start Designing <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/30 bg-white/10 hover:bg-white/20 text-white text-lg px-10 py-7 h-auto backdrop-blur-sm transition-all hover:scale-105"
              asChild
            >
              <Link href="#examples">
                Join the Drop
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <badge.icon className="w-5 h-5 text-[#16C1A8]" />
                <span className="text-white font-medium text-sm">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>

          {/* Subtext */}
          <p className="text-sm text-white/50 max-w-md pt-4">
            Start creating today and receive your premium custom apparel in days, not weeks.
          </p>
        </div>
      </div>
    </div>
  );
};
