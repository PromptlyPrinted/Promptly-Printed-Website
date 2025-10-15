import { Button } from '@repo/design-system/components/ui/button';
import { Brain, Shirt, Globe, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const WhyDifferent = () => {
  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Models',
      description: 'Exclusive trained models for apparel. Our AI understands fashion, composition, and wearability.',
      color: 'text-[#16C1A8]',
      bgColor: 'bg-[#16C1A8]/10',
    },
    {
      icon: Shirt,
      title: 'Premium Quality',
      description: '220gsm organic cotton. Heavyweight fabric that lasts, with professional-grade printing.',
      color: 'text-[#FF8A26]',
      bgColor: 'bg-[#FF8A26]/10',
    },
    {
      icon: Globe,
      title: 'Global Fulfillment',
      description: 'Printed locally, shipped fast. We have production partners worldwide for quick delivery.',
      color: 'text-[#0D2C45]',
      bgColor: 'bg-[#0D2C45]/10',
    },
    {
      icon: Star,
      title: 'One-of-One Drops',
      description: 'No duplicates. Every piece unique. Your design is exclusively yours, forever.',
      color: 'text-[#16C1A8]',
      bgColor: 'bg-[#16C1A8]/10',
    },
  ];

  return (
    <div className="w-full bg-[#0D2C45] py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-16">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[#FF8A26] font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </h2>
            <h3 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Not your average print-on-demand
            </h3>
            <p className="max-w-2xl text-lg text-white/70 leading-relaxed">
              We're building the future of custom apparel with cutting-edge AI and uncompromising quality.
            </p>
          </div>

          {/* Features Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative flex flex-col gap-4 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#16C1A8]/50 transition-all duration-300 hover:bg-white/10"
              >
                {/* Icon */}
                <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${feature.bgColor}`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-2xl font-bold text-white">
                    {feature.title}
                  </h4>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#16C1A8]/0 to-[#16C1A8]/0 group-hover:from-[#16C1A8]/5 group-hover:to-transparent transition-all duration-300" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-[#16C1A8]/25"
            asChild
          >
            <Link href="/designs">
              Design Yours <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
