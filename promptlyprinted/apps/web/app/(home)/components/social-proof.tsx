'use client';

import { Star } from 'lucide-react';

export const SocialProof = () => {
  const testimonials = [
    {
      name: 'Alex Chen',
      handle: '@alexdesigns',
      quote: 'AI fashion done right. The quality exceeded my expectations and the design came out exactly as I imagined.',
      image: '/placeholder-avatar-1.jpg',
      rating: 5,
    },
    {
      name: 'Sarah Williams',
      handle: '@sarahstyle',
      quote: 'Finally, a platform that combines cutting-edge AI with premium quality. My custom hoodie is amazing!',
      image: '/placeholder-avatar-2.jpg',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      handle: '@marcusj',
      quote: 'The attention to detail is incredible. From the fabric to the print quality, everything feels premium.',
      image: '/placeholder-avatar-3.jpg',
      rating: 5,
    },
    {
      name: 'Emma Rodriguez',
      handle: '@emmacreates',
      quote: "Love how easy it was to bring my idea to life. The AI understood exactly what I wanted, and the shipping was super fast.",
      image: '/placeholder-avatar-4.jpg',
      rating: 5,
    },
  ];

  return (
    <div className="w-full bg-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[#16C1A8] font-semibold text-sm uppercase tracking-wider">
              Community
            </h2>
            <h3 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] tracking-tight">
              Loved by creators worldwide
            </h3>
            <p className="max-w-2xl text-lg text-[#64748B] leading-relaxed">
              Join thousands of satisfied customers who've brought their designs to life.
            </p>
          </div>

          {/* Testimonials Carousel/Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 p-8 rounded-2xl bg-gradient-to-br from-[#F9FAFB] to-white border border-gray-200 hover:border-[#16C1A8] transition-all duration-300 hover:shadow-xl"
              >
                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[#FF8A26] text-[#FF8A26]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#1E293B] text-lg leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-2">
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16C1A8] to-[#0D2C45]" />
                  <div className="flex flex-col">
                    <p className="font-semibold text-[#1E293B]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#64748B]">{testimonial.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-200">
            {[
              { value: '10,000+', label: 'Designs Created' },
              { value: '5,000+', label: 'Happy Customers' },
              { value: '4.9/5', label: 'Average Rating' },
              { value: '50+', label: 'Countries Shipped' },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <p className="text-4xl font-bold text-[#16C1A8]">{stat.value}</p>
                <p className="text-sm text-[#64748B] text-center">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
