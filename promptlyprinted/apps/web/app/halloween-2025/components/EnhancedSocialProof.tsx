'use client';

import { Star, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export const EnhancedSocialProof = () => {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const reviews = [
    {
      name: "Sarah Mitchell",
      location: "London, UK",
      rating: 5,
      image: "👩‍🎤",
      review: "Absolutely stunning quality! The AI design tool helped me create the perfect Halloween costume. Got so many compliments at the party!",
      product: "Custom Halloween Hoodie",
      verified: true,
    },
    {
      name: "James Porter",
      location: "Manchester, UK",
      rating: 5,
      image: "👨‍🎨",
      review: "Ordered for my whole family - the group design feature is brilliant! Arrived in 2 days, perfect quality. Will definitely order again.",
      product: "Family Halloween T-Shirts (x4)",
      verified: true,
    },
    {
      name: "Emily Richardson",
      location: "Bristol, UK",
      rating: 5,
      image: "👩‍🦰",
      review: "As a professional costume designer, I'm impressed! The print quality rivals professional screen printing. The AI suggestions were spot-on.",
      product: "Custom Vampire Design Tee",
      verified: true,
      badge: "Verified Professional"
    },
    {
      name: "Marcus Thompson",
      location: "Birmingham, UK",
      rating: 5,
      image: "👨‍💼",
      review: "Ordered last minute for a Halloween event - express delivery saved me! The quality exceeded my expectations for the price.",
      product: "Express Halloween Hoodie",
      verified: true,
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "2,547+", icon: Users },
    { label: "Average Rating", value: "4.9/5", icon: Star },
    { label: "Repeat Customers", value: "73%", icon: TrendingUp },
  ];

  const trustBadges = [
    { icon: "✓", text: "Eco-Friendly Materials" },
    { icon: "✓", text: "100% Satisfaction Guarantee" },
    { icon: "✓", text: "Secure Checkout" },
    { icon: "✓", text: "Fast UK Delivery" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#16213e] to-[#1a0b2e]">
      <div className="container mx-auto px-6">
        {/* Trust Statistics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-purple-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Reviews Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">Halloween Enthusiasts</span>
            </h2>
            <p className="text-xl text-purple-200">Join thousands of satisfied customers who've created their perfect Halloween look</p>
          </div>

          {/* Main Review Showcase */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="text-6xl">{reviews[activeReviewIndex].image}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{reviews[activeReviewIndex].name}</h3>
                    {reviews[activeReviewIndex].verified && (
                      <span className="flex items-center gap-1 bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                    {reviews[activeReviewIndex].badge && (
                      <span className="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
                        {reviews[activeReviewIndex].badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      {[...Array(reviews[activeReviewIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                    <span className="text-purple-300 text-sm">• {reviews[activeReviewIndex].location}</span>
                  </div>
                  <p className="text-lg text-purple-100 mb-4 leading-relaxed">
                    "{reviews[activeReviewIndex].review}"
                  </p>
                  <div className="text-sm text-purple-300">
                    Product: <span className="text-orange-300 font-semibold">{reviews[activeReviewIndex].product}</span>
                  </div>
                </div>
              </div>

              {/* Review Navigation */}
              <div className="flex justify-center gap-2">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveReviewIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === activeReviewIndex
                        ? 'bg-orange-500 w-8'
                        : 'bg-purple-500/30 hover:bg-purple-500/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {reviews.slice(1, 4).map((review, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => setActiveReviewIndex(idx + 1)}
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-purple-100 mb-4 line-clamp-3">"{review.review}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{review.image}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{review.name}</div>
                    <div className="text-purple-400 text-xs">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-purple-900/30 to-orange-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
          <div className="grid md:grid-cols-4 gap-6">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600/20 text-green-400 rounded-full flex items-center justify-center text-lg border border-green-500/30">
                  {badge.icon}
                </div>
                <span className="text-white font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Ticker */}
        <div className="mt-8 flex items-center justify-center gap-2 text-purple-300 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>127 people are designing their Halloween look right now</span>
        </div>
      </div>
    </section>
  );
};
