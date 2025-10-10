'use client';

import { useState, useEffect } from 'react';
import { Star, Heart, Users } from 'lucide-react';

export const SocialProof = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah M.",
      location: "London",
      rating: 5,
      text: "The AI created exactly what I envisioned! My vampire queen design turned out absolutely stunning.",
      image: "/api/placeholder/64/64", // Placeholder - replace with actual customer photos
      design: "Gothic Vampire Queen Hoodie"
    },
    {
      name: "James R.",
      location: "Manchester",
      rating: 5,
      text: "Ordered last minute and got it in 48 hours. Perfect quality and my zombie design was incredible!",
      image: "/api/placeholder/64/64",
      design: "Zombie Apocalypse T-Shirt"
    },
    {
      name: "Emma L.",
      location: "Edinburgh",
      rating: 5,
      text: "Made matching Halloween shirts for the whole family. The kids loved their cute ghost designs!",
      image: "/api/placeholder/64/64",
      design: "Family Ghost Squad Collection"
    },
  ];

  const recentActivity = [
    { user: "Alex from Birmingham", action: "just created", design: "Spooky Pumpkin Hoodie" },
    { user: "Katie from Bristol", action: "just ordered", design: "Witch's Brew T-Shirt" },
    { user: "Ryan from Liverpool", action: "just designed", design: "Haunted Forest Long Sleeve" },
    { user: "Sophie from Leeds", action: "just created", design: "Black Cat Mystique Hoodie" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1419] to-[#16213e]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
              Creations from the Crypt
            </span>
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            See what our fellow ghouls and goblins have been conjuring up
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Customer Testimonials */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Spook-tacular Reviews ⭐
            </h3>

            <div className="relative bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 min-h-[200px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-8 transition-all duration-500 ${
                    index === currentTestimonial
                      ? 'opacity-100 transform translate-x-0'
                      : 'opacity-0 transform translate-x-4'
                  }`}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white text-lg mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-purple-300 text-sm">{testimonial.location}</div>
                      <div className="text-orange-300 text-xs">{testimonial.design}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Testimonial Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial
                        ? 'bg-orange-400 w-6'
                        : 'bg-purple-400/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Live Halloween Magic 🎃
            </h3>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="text-purple-200">
                      <span className="text-white font-semibold">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="text-orange-300">"{activity.design}"</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Stats */}
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">2,500+</div>
                  <div className="text-purple-200 text-sm">Happy Halloween Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">4.9★</div>
                  <div className="text-purple-200 text-sm">Average Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">48hrs</div>
                  <div className="text-purple-200 text-sm">Express Delivery</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                  <div className="text-purple-200 text-sm">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-purple-200 text-lg">
            <Heart className="w-5 h-5 text-red-400" />
            <span>Join our community of creative Halloween enthusiasts</span>
            <Heart className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>
    </section>
  );
};