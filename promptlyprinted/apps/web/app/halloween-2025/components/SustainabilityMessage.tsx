import { Leaf, Recycle, Heart, Award } from 'lucide-react';

export const SustainabilityMessage = () => {
  const ecoFeatures = [
    {
      icon: <Leaf className="w-8 h-8 text-green-400" />,
      title: "Organic Cotton",
      description: "100% certified organic cotton that's gentle on skin and planet"
    },
    {
      icon: <Recycle className="w-8 h-8 text-green-400" />,
      title: "Recycled Materials",
      description: "Eco-friendly polyester blends made from recycled plastic bottles"
    },
    {
      icon: <Heart className="w-8 h-8 text-green-400" />,
      title: "Ethically Made",
      description: "Fair trade manufacturing with safe working conditions"
    },
    {
      icon: <Award className="w-8 h-8 text-green-400" />,
      title: "Carbon Neutral",
      description: "We offset 100% of our shipping and production emissions"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1419] to-[#0a1a0a]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Sustainable Spook
            </span>
            <br />
            Meets Cutting-Edge Style
          </h2>
          <p className="text-xl text-green-200 max-w-3xl mx-auto leading-relaxed">
            Halloween doesn't have to haunt the planet. Our eco-friendly approach ensures your
            custom apparel looks amazing while protecting the environment for future generations.
          </p>
        </div>

        {/* Eco Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
          {ecoFeatures.map((feature, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-full flex items-center justify-center mb-6 group-hover:border-green-400/50 group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">
                {feature.title}
              </h3>

              <p className="text-green-200 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Impact Stats */}
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Our 2024 Environmental Impact
          </h3>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">50,000+</div>
              <div className="text-green-200">Plastic Bottles Recycled</div>
              <div className="text-green-300 text-sm mt-1">Into premium fabric</div>
            </div>

            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">75%</div>
              <div className="text-green-200">Less Water Usage</div>
              <div className="text-green-300 text-sm mt-1">Vs traditional printing</div>
            </div>

            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-green-200">Carbon Neutral</div>
              <div className="text-green-300 text-sm mt-1">Shipping & production</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-green-200 text-lg mb-4">
            <Leaf className="w-5 h-5 text-green-400" />
            <span>Join the sustainable Halloween revolution</span>
            <Leaf className="w-5 h-5 text-green-400" />
          </div>

          <p className="text-green-300 text-sm max-w-2xl mx-auto">
            Every design you create contributes to a more sustainable fashion industry.
            Your style choices today help preserve the planet for tomorrow's Halloween celebrations.
          </p>
        </div>
      </div>
    </section>
  );
};