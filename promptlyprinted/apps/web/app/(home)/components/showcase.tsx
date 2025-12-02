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
    title: 'Character Figure',
    description: 'Turn your photo into a collectible character figure with packaging.',
    prompt:
      "Turn this photo into a character figure. Behind it, place a box with the character's image printed on it, and a computer showing the 3D modeling process. In front, add a round plastic base with the character figure standing on it",
    gradient: 'from-[#031A30] via-[#0AA5A6] to-[#F86F2D]',
  },
  {
    category: 'Tee',
    title: 'Custom Sticker Art',
    description: 'Transform any character into playful white outline stickers.',
    prompt:
      'Turn this character into a white outline sticker with web illustration style. Add a playful white outline phrase describing the character, similar to popular sticker designs',
    gradient: 'from-[#0B1F3A] via-[#FE4D80] to-[#FED766]',
  },
  {
    category: 'Tee',
    title: 'Marble Sculpture',
    description: 'Create an ultra-detailed marble sculpture from any subject.',
    prompt:
      'A photorealistic image of an ultra-detailed sculpture made of shining marble. Display smooth and reflective marble surface, emphasizing luster and artistic craftsmanship. Elegant design highlighting the beauty and depth of marble with stunning lighting',
    gradient: 'from-[#010C1C] via-[#123B68] to-[#DAA520]',
  },
  {
    category: 'Hoodie',
    title: 'Isometric Buildings',
    description: 'Extract buildings from photos and transform to isometric models.',
    prompt:
      'Make image daytime and isometric [building only]. Extract the architecture and transform it into a clean isometric 3D model with vibrant colors',
    gradient: 'from-[#1B1F3A] via-[#7F5AF0] to-[#2CB67D]',
  },
  {
    category: 'Hoodie',
    title: 'Character Design Sheet',
    description: 'Generate complete character design with multiple views and expressions.',
    prompt:
      'Generate character design: proportion design with different height comparisons, three views (front, side, back), expression sheet with various emotions, pose sheet with common poses, and costume design details',
    gradient: 'from-[#050505] via-[#FF0054] to-[#FFA630]',
  },
  {
    category: 'Print',
    title: 'Era Time Travel',
    description: 'Transform portraits into different historical eras with authentic styling.',
    prompt:
      "Change the character's style to 1970's classical style. Add long curly hair, vintage mustache, change background to iconic californian summer landscape. Keep the character's face unchanged",
    gradient: 'from-[#0C1B33] via-[#2E5077] to-[#A1A19F]',
  },
  {
    category: 'Print',
    title: 'Multi-Character Scene',
    description: 'Combine multiple reference images into one cohesive scene.',
    prompt:
      'A model posing against a colorful backdrop. Combine multiple reference objects: character wearing specific items, accessories as details, pets with matching accessories. Scene against a complementary background',
    gradient: 'from-[#041106] via-[#0F5B30] to-[#56C596]',
  },
  {
    category: 'Kids',
    title: 'Hairstyle Grid',
    description: 'Generate the same person with different hairstyles in a grid.',
    prompt:
      'Generate avatars of this person with different hairstyles in a 3x3 grid format. Show various styles: long, short, curly, straight, colored, natural',
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
