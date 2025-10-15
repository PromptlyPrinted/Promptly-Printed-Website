import { Button } from '@repo/design-system/components/ui/button';
import { Lightbulb, Sparkles, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      icon: Lightbulb,
      title: 'Type your idea',
      description: 'Describe your concept with AI.',
      color: 'from-[#16C1A8] to-[#16C1A8]/70',
    },
    {
      number: '2',
      icon: Sparkles,
      title: 'See it come to life',
      description: 'Our AI generates your custom designs.',
      color: 'from-[#FF8A26] to-[#FF8A26]/70',
    },
    {
      number: '3',
      icon: Package,
      title: 'We print & ship',
      description: 'Premium fabric, delivered worldwide.',
      color: 'from-[#0D2C45] to-[#0D2C45]/70',
    },
  ];

  return (
    <div className="w-full bg-gradient-to-b from-white to-[#F9FAFB] py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-16">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[#FF8A26] font-semibold text-sm uppercase tracking-wider">
              How It Works
            </h2>
            <h3 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] tracking-tight">
              From idea to wearable art in 3 simple steps
            </h3>
            <p className="max-w-2xl text-lg text-[#64748B] leading-relaxed">
              Creating your custom apparel has never been easier. Our AI-powered platform takes care of everything.
            </p>
          </div>

          {/* Steps */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative flex flex-col items-center gap-6 p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#16C1A8] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-8">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-xl shadow-lg`}>
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="mt-4 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F9FAFB] to-white border border-gray-200 group-hover:border-[#16C1A8] transition-colors">
                  <step.icon className="w-10 h-10 text-[#0D2C45] group-hover:text-[#16C1A8] transition-colors" />
                </div>

                {/* Content */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <h4 className="text-2xl font-bold text-[#1E293B]">
                    {step.title}
                  </h4>
                  <p className="text-[#64748B] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Arrow (hidden on mobile and last item) */}
                {step.number !== '3' && (
                  <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-[#16C1A8]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="gap-2 bg-[#0D2C45] hover:bg-[#0D2C45]/90 text-white text-lg px-8 py-6 h-auto shadow-lg"
            asChild
          >
            <Link href="/designs">
              Start Your First Drop <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
