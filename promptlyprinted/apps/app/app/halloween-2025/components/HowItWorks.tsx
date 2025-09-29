import { Wand2, Sparkles, Truck } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      icon: <Wand2 className="w-12 h-12 text-orange-400" />,
      title: "Cast Your Spell",
      description: "Write your spooky design idea or use our Enchanted Design Cauldron for magical inspiration",
      details: ["AI-powered prompt suggestions", "Halloween theme library", "Custom text & imagery"],
    },
    {
      icon: <Sparkles className="w-12 h-12 text-purple-400" />,
      title: "AI Magic Unleashed",
      description: "Our artificial intelligence brings your vision to life in seconds with premium design quality",
      details: ["Advanced AI processing", "Multiple design variations", "Professional quality output"],
    },
    {
      icon: <Truck className="w-12 h-12 text-orange-400" />,
      title: "Phantom Fast Delivery",
      description: "Premium quality printing delivered to your door in 48 hours, just in time for Halloween",
      details: ["Express printing", "Quality materials", "Halloween delivery guarantee"],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#16213e] to-[#0f1419]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Summon Your Perfect{' '}
            <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
              Halloween Look
            </span>
            <br />
            in 3 Steps
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            From concept to creation, our AI-powered process makes designing your dream Halloween apparel
            as easy as casting a spell
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Step Number */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-300 transition-colors">
                {step.title}
              </h3>
              <p className="text-purple-200 text-lg mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Step Details */}
              <ul className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <li
                    key={detailIndex}
                    className="text-purple-300 text-sm flex items-center justify-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    {detail}
                  </li>
                ))}
              </ul>

              {/* Connection Line (for desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-orange-500 opacity-30 transform translate-x-4"></div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-purple-200 text-lg">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>Ready to create magic?</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>
    </section>
  );
};