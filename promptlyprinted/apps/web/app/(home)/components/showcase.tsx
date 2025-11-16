'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ShowcaseDesign = {
  category: string;
  title: string;
  description: string;
  prompt: string;
  gradient: string;
};

const designs: ShowcaseDesign[] = [
  {
    category: 'Tee',
    title: 'Neon Alley Cat',
    description: 'Bold cyberpunk energy with glowing signage and chrome accents.',
    prompt:
      "Hyper-detailed cyberpunk alley with a teal cat wearing neon goggles, vaporwave lighting, cinematic depth of field",
    gradient: 'from-[#031A30] via-[#0AA5A6] to-[#F86F2D]',
  },
  {
    category: 'Tee',
    title: 'Geometric Dawn',
    description: 'Layered shapes melt into a warm sunrise palette.',
    prompt:
      'Abstract geometric landscape with layered polygons, sunrise lighting, soft gradients, printed on a cream tee',
    gradient: 'from-[#0B1F3A] via-[#FE4D80] to-[#FED766]',
  },
  {
    category: 'Tee',
    title: 'Orbit Explorer',
    description: 'Retro space mission patch reimagined for modern streetwear.',
    prompt:
      'Vintage astronaut badge, bold serif typography, deep navy background, metallic ink details, 1970s NASA poster',
    gradient: 'from-[#010C1C] via-[#123B68] to-[#DAA520]',
  },
  {
    category: 'Hoodie',
    title: 'Aurora Bloom',
    description: 'Soft gradients spill over oversized florals for cozy vibes.',
    prompt:
      'Oversized watercolor peonies blending into aurora borealis light, dreamy ink bleed, charcoal hoodie mockup',
    gradient: 'from-[#1B1F3A] via-[#7F5AF0] to-[#2CB67D]',
  },
  {
    category: 'Hoodie',
    title: 'Graffiti Pulse',
    description: 'Sharp street-art strokes with chrome and magenta pops.',
    prompt:
      '3D graffiti lettering spelling Promptly, chrome shine, magenta splatter, motion blur, photographed on black hoodie',
    gradient: 'from-[#050505] via-[#FF0054] to-[#FFA630]',
  },
  {
    category: 'Print',
    title: 'Coastal Minimal',
    description: 'Clean lines and muted tones for modern interiors.',
    prompt:
      'Minimalist continuous line art of rolling waves, taupe background, terracotta sun, Scandinavian poster aesthetic',
    gradient: 'from-[#0C1B33] via-[#2E5077] to-[#A1A19F]',
  },
  {
    category: 'Print',
    title: 'Rainforest Haze',
    description: 'Lush foliage rendered with painterly textures.',
    prompt:
      'Dreamy rainforest canopy, volumetric light rays, watercolor textures, parrots in silhouette, fine art print',
    gradient: 'from-[#041106] via-[#0F5B30] to-[#56C596]',
  },
  {
    category: 'Kids',
    title: 'Cosmic Critters',
    description: 'Playful characters exploring a candy-colored galaxy.',
    prompt:
      'Cute astronauts shaped like woodland animals, pastel planets, glitter stars, kawaii style, kids tee print',
    gradient: 'from-[#140A44] via-[#7B5CE5] to-[#FFB6C1]',
  },
];

export const Showcase = () => {
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

          {/* Gallery Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {designs.map((design) => (
              <div
                key={design.title}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-[#050F1D] text-white shadow-lg transition-all duration-300 hover:border-[#16C1A8]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${design.gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex h-full flex-col justify-between gap-4 p-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-white/80">
                    <span>{design.category}</span>
                    <span className="h-px flex-1 mx-3 bg-white/30" />
                    <span>Concept</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight">
                      {design.title}
                    </h4>
                    <p className="mt-2 text-sm text-white/80">
                      {design.description}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                      Prompt
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">
                      “{design.prompt}”
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/design/mens-classic-t-shirt"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#16C1A8] px-8 py-3 font-semibold text-lg text-white bg-[#16C1A8] transition-colors hover:bg-[#0D2C45]"
            >
              Design Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/prompt-library"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#16C1A8] px-8 py-3 font-semibold text-lg text-[#16C1A8] transition-all hover:bg-[#16C1A8]/10"
            >
              See More Examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
