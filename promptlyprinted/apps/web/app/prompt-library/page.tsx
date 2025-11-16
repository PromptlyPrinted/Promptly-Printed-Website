import { createMetadata } from '@repo/seo/metadata';
import { Paintbrush, Sparkles, Wand2 } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = createMetadata({
  title: 'Prompt Library | Promptly Printed',
  description:
    'Explore curated AI prompts organized by apparel type and vibe to kickstart your next design.',
});

type PromptExample = {
  title: string;
  description: string;
  prompt: string;
  palette: string[];
  tags: string[];
};

type PromptCategory = {
  name: string;
  icon: ReactNode;
  accent: string;
  prompts: PromptExample[];
};

const promptCategories: PromptCategory[] = [
  {
    name: 'Statement Tees',
    icon: <Sparkles className="h-5 w-5" />,
    accent: 'from-slate-900 via-slate-800 to-slate-900',
    prompts: [
      {
        title: 'Solar Bloom',
        description: 'Bold florals with cosmic gradients for festival-ready tees.',
        prompt:
          'Hyper-detailed peony exploding into solar flares, saturated magenta + gold palette, grainy retro texture, centered placement',
        palette: ['#FF5FA2', '#FFC371', '#0E1B2A'],
        tags: ['bold', 'floral', 'festival'],
      },
      {
        title: 'Analog Waves',
        description: 'Retro surf lines with distressed typography.',
        prompt:
          'Hand-drawn wave pattern inspired by 70s album covers, muted teal + sun-faded orange, stacked vintage lettering reading "Endless Summer"',
        palette: ['#0B7285', '#F59E0B', '#F3EED9'],
        tags: ['retro', 'surf', 'typography'],
      },
      {
        title: 'Architectural Minimal',
        description: 'Clean geometric illustration for upscale basics.',
        prompt:
          'Minimal continuous-line skyline, brutalist arches, grayscale with single accent color, negative space emphasis',
        palette: ['#111827', '#6B7280', '#10B981'],
        tags: ['minimal', 'line art', 'modern'],
      },
    ],
  },
  {
    name: 'Premium Hoodies',
    icon: <Paintbrush className="h-5 w-5" />,
    accent: 'from-[#0D1F2D] via-[#12395B] to-[#09111D]',
    prompts: [
      {
        title: 'Opal Glitch',
        description: 'Holographic streaks with motion blur highlights.',
        prompt:
          'Abstract opal shards suspended mid-air, iridescent lighting, subtle glitch effect, printed oversized across the chest',
        palette: ['#33FFF3', '#9273FF', '#050914'],
        tags: ['futuristic', 'gradient', 'streetwear'],
      },
      {
        title: 'Botanical Shadow',
        description: 'Moody foliage silhouettes cascading down the sleeves.',
        prompt:
          'Layered monstera leaves in ink wash style, emerald + charcoal palette, asymmetric placement along hoodie seams',
        palette: ['#064E3B', '#0F172A', '#84CC16'],
        tags: ['organic', 'textured', 'asymmetric'],
      },
      {
        title: 'Midnight Script',
        description: 'Hand-lettered mantra with metallic sheen.',
        prompt:
          'Custom brush script reading "built to create", champagne metallic ink, subtle paint splatter backdrop, centered composition',
        palette: ['#F9E7BB', '#1F2937', '#F97316'],
        tags: ['lettering', 'lux', 'metallic'],
      },
    ],
  },
  {
    name: 'Art Prints & Decor',
    icon: <Wand2 className="h-5 w-5" />,
    accent: 'from-[#1C0F28] via-[#322C54] to-[#12081B]',
    prompts: [
      {
        title: 'Desert Mirage',
        description: 'Dreamy desertscape with painterly gradients.',
        prompt:
          'Soft brush desert dunes, twin moons overhead, dusty mauve + terracotta palette, minimal foreground cactus silhouette',
        palette: ['#FFB199', '#B06AB3', '#301934'],
        tags: ['interiors', 'surreal', 'warm'],
      },
      {
        title: 'Tidal Blueprint',
        description: 'Scientific illustration aesthetic for modern walls.',
        prompt:
          'Blueprint style diagram of ocean currents, white linework on deep navy, annotated typography, subtle paper grain',
        palette: ['#001F3F', '#4C6FFF', '#E5E7EB'],
        tags: ['technical', 'nautical', 'monochrome'],
      },
      {
        title: 'Garden Reverie',
        description: 'Maximalist florals with vintage collage vibes.',
        prompt:
          'Victorian botanical collage layered with butterflies, sepia newsprint texture, saturated jewel tones, poster aspect ratio',
        palette: ['#8B5CF6', '#EC4899', '#F5F5DC'],
        tags: ['maximal', 'botanical', 'collage'],
      },
    ],
  },
];

const quickTips = [
  'Lead with subject, finish with medium + finish: “watercolor peonies, metallic ink highlights”.',
  'Call out placement (“full back print”, “pocket icon”) so AI frames the art correctly.',
  'Mention garments; “black heavyweight hoodie” yields better lighting and contrast.',
  'List 2–3 palette swatches using color names or hex codes for consistent output.',
];

export default function PromptLibraryPage() {
  return (
    <div className="bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1C30] via-[#10263E] to-[#05101C] opacity-80" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 py-20 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            <Sparkles className="h-4 w-4" />
            Prompt Library
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Prompts that make printers & AI happy
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/70">
            Tap into ready-to-use descriptions organized by apparel type and
            vibe. Each prompt highlights placement cues, palettes, and textures
            so your generated art is production-ready from the first render.
          </p>
          <div className="grid gap-4 text-left sm:grid-cols-3">
            {['High-impact graphics', 'Color-locked palettes', 'Print-friendly composition'].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="space-y-10">
          {promptCategories.map((category) => (
            <div
              key={category.name}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 shadow-2xl"
            >
              <div
                className={`rounded-2xl border border-white/10 bg-gradient-to-r ${category.accent} p-6 text-white shadow-inner`}
              >
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20">
                    {category.icon}
                  </span>
                  {category.name}
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  {category.prompts.map((prompt) => (
                    <div
                      key={prompt.title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        {prompt.tags.join(' • ')}
                      </div>
                      <h3 className="mt-2 text-xl font-semibold">
                        {prompt.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/80">
                        {prompt.description}
                      </p>
                      <div className="mt-4 rounded-xl bg-black/30 p-4 text-sm leading-relaxed">
                        “{prompt.prompt}”
                      </div>
                      <div className="mt-4 flex gap-2">
                        {prompt.palette.map((color) => (
                          <span
                            key={color}
                            className="h-8 w-8 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
          <h2 className="text-2xl font-semibold">Quick prompt upgrades</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickTips.map((tip) => (
              <div
                key={tip}
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/80"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
