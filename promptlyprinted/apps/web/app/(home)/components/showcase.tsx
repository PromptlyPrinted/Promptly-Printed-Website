'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const Showcase = () => {
  const [activeTab, setActiveTab] = useState<'tees' | 'hoodies' | 'prints'>('tees');

  // Placeholder examples - replace with actual designs
  const examples = {
    tees: [
      {
        prompt: 'Cyberpunk cat in neon city',
        image: '/placeholder-design-1.jpg',
      },
      {
        prompt: 'Abstract geometric sunset',
        image: '/placeholder-design-2.jpg',
      },
      {
        prompt: 'Vintage space explorer',
        image: '/placeholder-design-3.jpg',
      },
      {
        prompt: 'Minimalist mountain range',
        image: '/placeholder-design-4.jpg',
      },
      {
        prompt: 'Retro gaming aesthetic',
        image: '/placeholder-design-5.jpg',
      },
      {
        prompt: 'Ocean waves and sunset',
        image: '/placeholder-design-6.jpg',
      },
    ],
    hoodies: [
      {
        prompt: 'Abstract art hoodie',
        image: '/placeholder-hoodie-1.jpg',
      },
      {
        prompt: 'Street art style',
        image: '/placeholder-hoodie-2.jpg',
      },
    ],
    prints: [
      {
        prompt: 'Digital art print',
        image: '/placeholder-print-1.jpg',
      },
      {
        prompt: 'Nature inspired',
        image: '/placeholder-print-2.jpg',
      },
    ],
  };

  return (
    <div id="examples" className="w-full bg-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[#16C1A8] font-semibold text-sm uppercase tracking-wider">
              AI Showcase
            </h2>
            <h3 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] tracking-tight">
              Your imagination, brought to life
            </h3>
            <p className="max-w-2xl text-lg text-[#64748B] leading-relaxed">
              See what others have created with our AI. From bold statements to subtle art, every design is unique.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 p-1 bg-[#F9FAFB] rounded-xl border border-gray-200">
            {(['tees', 'hoodies', 'prints'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium text-sm uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-white text-[#16C1A8] shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {examples[activeTab].map((example, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-[#F9FAFB] border border-gray-200 hover:border-[#16C1A8] transition-all duration-300 hover:shadow-2xl"
              >
                {/* Image Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-[#0D2C45] via-[#16C1A8] to-[#FF8A26] opacity-20" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2C45] via-[#0D2C45]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white font-medium text-sm mb-2">
                    Prompt →
                  </p>
                  <p className="text-white text-lg font-semibold">
                    {example.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/designs"
            className="group inline-flex items-center gap-2 text-[#16C1A8] hover:text-[#0D2C45] font-semibold text-lg transition-colors"
          >
            Create Your Design
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
