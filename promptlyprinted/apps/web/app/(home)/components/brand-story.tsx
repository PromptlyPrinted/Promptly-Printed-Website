import { Leaf, Recycle, Heart, Zap } from 'lucide-react';

export const BrandStory = () => {
  const values = [
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'Cutting-edge AI meets timeless fashion.',
    },
    {
      icon: Leaf,
      title: 'Sustainable',
      description: 'Organic materials and eco-friendly printing.',
    },
    {
      icon: Recycle,
      title: 'Zero Waste',
      description: 'Print-on-demand means no overproduction.',
    },
    {
      icon: Heart,
      title: 'Made with Care',
      description: 'Every piece is crafted with attention to detail.',
    },
  ];

  return (
    <div className="w-full bg-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-[#16C1A8] font-semibold text-sm uppercase tracking-wider">
                Our Story
              </h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] tracking-tight">
                Building the future of fashion
              </h3>
            </div>

            <div className="flex flex-col gap-6 text-lg text-[#64748B] leading-relaxed">
              <p>
                We're building the future of fashion — <span className="font-semibold text-[#1E293B]">personal, sustainable, on-demand</span>.
              </p>
              <p>
                Traditional fashion is broken. Mass production leads to waste, and cookie-cutter designs lack personality. We believe everyone deserves to wear something truly unique, something that represents who they are.
              </p>
              <p>
                Every order is <span className="font-semibold text-[#1E293B]">printed only when you design it</span> — zero waste, maximum creativity. We combine the latest AI technology with sustainable practices to create apparel that's good for you and the planet.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-[#F9FAFB] to-white border border-gray-200 hover:border-[#16C1A8] transition-all duration-300 hover:shadow-lg"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#16C1A8]/10 to-[#0D2C45]/10">
                  <value.icon className="w-7 h-7 text-[#16C1A8]" />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xl font-bold text-[#1E293B]">
                    {value.title}
                  </h4>
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-[#0D2C45] to-[#16C1A8]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '100%', label: 'Organic Cotton', sublabel: 'Sustainable materials' },
              { value: '0', label: 'Overproduction', sublabel: 'Zero waste model' },
              { value: '∞', label: 'Design Possibilities', sublabel: 'Unlimited creativity' },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col gap-2">
                <p className="text-5xl font-bold text-white">{stat.value}</p>
                <p className="text-xl font-semibold text-white">{stat.label}</p>
                <p className="text-sm text-white/70">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
