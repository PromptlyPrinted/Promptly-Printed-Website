'use client';

import { Star, MapPin } from 'lucide-react';
import Image from 'next/image';

export const SocialProof = () => {
  const testimonials = [
    {
      name: 'Alex Chen',
      handle: '@alexdesigns',
      country: 'United States',
      countryFlag: '🇺🇸',
      quote: 'AI fashion done right. The quality exceeded my expectations and the design came out exactly as I imagined.',
      image: '/testimonials/alex-chen.jpg',
      rating: 5,
    },
    {
      name: 'Sarah Williams',
      handle: '@sarahstyle',
      country: 'United Kingdom',
      countryFlag: '🇬🇧',
      quote: 'Finally, a platform that combines cutting-edge AI with premium quality. My custom hoodie is amazing!',
      image: '/testimonials/sarah-williams.jpg',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      handle: '@marcusj',
      country: 'Canada',
      countryFlag: '🇨🇦',
      quote: 'The attention to detail is incredible. From the fabric to the print quality, everything feels premium.',
      image: '/testimonials/marcus-johnson.jpg',
      rating: 5,
    },
    {
      name: 'Emma Rodriguez',
      handle: '@emmacreates',
      country: 'Australia',
      countryFlag: '🇦🇺',
      quote: "Love how easy it was to bring my idea to life. The AI understood exactly what I wanted, and the shipping was super fast.",
      image: '/testimonials/emma-rodriguez.jpg',
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

                {/* Author with Photo and Location */}
                <div className="flex items-start gap-4 mt-2 pt-4 border-t border-gray-200">
                  {/* Avatar with Image */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#16C1A8] to-[#0D2C45] flex-shrink-0 ring-2 ring-gray-200">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="font-semibold text-[#1E293B] text-lg">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#64748B]">{testimonial.handle}</p>

                    {/* Country Badge */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200">
                        <span className="text-base">{testimonial.countryFlag}</span>
                        <MapPin className="w-3 h-3 text-[#64748B]" />
                        <span className="text-xs font-medium text-[#64748B]">
                          {testimonial.country}
                        </span>
                      </div>
                    </div>
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
