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
        title: 'Character to Figure',
        description: 'Transform photos into collectible character figures with packaging.',
        prompt:
          'Turn this photo into a character figure. Behind it, place a box with the character\'s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it',
        palette: ['#FF5FA2', '#FFC371', '#0E1B2A'],
        tags: ['3D', 'character', 'collectible'],
      },
      {
        title: 'White Outline Stickers',
        description: 'Create playful sticker designs from any character.',
        prompt:
          'Turn the character into a white outline sticker similar to popular web illustration style. Transform into web illustration style, and add a playful white outline short phrase describing the character',
        palette: ['#FFFFFF', '#000000', '#FF6B9D'],
        tags: ['sticker', 'outline', 'playful'],
      },
      {
        title: 'Photo Enhancement Pro',
        description: 'Automatically enhance boring photos with AI magic.',
        prompt:
          'This photo is very boring and plain. Enhance it! Increase the contrast, boost the colors, and improve the lighting to make it richer. You can crop and delete details that affect the composition',
        palette: ['#FF6B35', '#004E89', '#F7B801'],
        tags: ['enhance', 'auto', 'vibrant'],
      },
    ],
  },
  {
    name: 'Premium Hoodies',
    icon: <Paintbrush className="h-5 w-5" />,
    accent: 'from-[#0D1F2D] via-[#12395B] to-[#09111D]',
    prompts: [
      {
        title: 'Isometric Architecture',
        description: 'Extract buildings and transform to clean isometric models.',
        prompt:
          'Make image daytime and isometric [building only]. Extract the architecture and transform it into a clean isometric 3D model with vibrant colors and clear geometric shapes',
        palette: ['#33FFF3', '#9273FF', '#050914'],
        tags: ['isometric', '3D', 'architecture'],
      },
      {
        title: 'Character Design Sheet',
        description: 'Complete character design with views and expressions.',
        prompt:
          'Generate character design: proportion design (different height comparisons, head-to-body ratio), three views (front, side, back), expression sheet with various emotions, pose sheet with common poses, and costume design details',
        palette: ['#FF6B9D', '#4ECDC4', '#1A1A2E'],
        tags: ['character', 'design', 'reference'],
      },
      {
        title: 'Marble Sculpture',
        description: 'Ultra-detailed marble sculpture with stunning lighting.',
        prompt:
          'A photorealistic image of an ultra-detailed sculpture made of shining marble. Display smooth and reflective marble surface, emphasizing its luster and artistic craftsmanship. The design is elegant, highlighting the beauty and depth of marble',
        palette: ['#F5F5F5', '#8B7355', '#2C2C2C'],
        tags: ['sculpture', 'marble', 'classical'],
      },
    ],
  },
  {
    name: 'Art Prints & Decor',
    icon: <Wand2 className="h-5 w-5" />,
    accent: 'from-[#1C0F28] via-[#322C54] to-[#12081B]',
    prompts: [
      {
        title: 'Era Time Travel',
        description: 'Transform portraits into different historical eras.',
        prompt:
          "Change the character\'s style to [1970]\'s classical style. Add [long curly] hair, [long mustache], change the background to the iconic [californian summer landscape]. Don\'t change the character\'s face",
        palette: ['#FFB199', '#B06AB3', '#301934'],
        tags: ['vintage', 'portrait', 'era'],
      },
      {
        title: 'Hairstyle Variations',
        description: 'Generate multiple hairstyle options in a grid format.',
        prompt:
          'Generate avatars of this person with different hairstyles in a 3x3 grid format. Show various styles: long, short, curly, straight, colored, natural, braided, updos, and modern cuts',
        palette: ['#FF6B9D', '#4ECDC4', '#FFE66D'],
        tags: ['hairstyle', 'grid', 'variations'],
      },
      {
        title: 'Multi-Reference Composite',
        description: 'Combine multiple reference images into one scene.',
        prompt:
          'A model is posing against a vibrant backdrop. Combine multiple reference objects: the model wearing specific items from references, accessories as keychain details, companion animals with matching accessories. Scene against a complementary colored background',
        palette: ['#FF1654', '#247BA0', '#F3FFBD'],
        tags: ['composite', 'multi-ref', 'scene'],
      },
    ],
  },
  {
    name: 'Collectibles & Toys',
    icon: <Sparkles className="h-5 w-5" />,
    accent: 'from-[#2D1B4E] via-[#6B46C1] to-[#1A0B2E]',
    prompts: [
      {
        title: 'LEGO Minifigure Box',
        description: 'Transform people into LEGO minifigure packaging.',
        prompt:
          'Transform the person into a LEGO minifigure packaging box style, presented in isometric perspective. Inside the box, display the LEGO minifigure based on the person, along with their essential items as LEGO accessories. Beside the box, display the actual LEGO minifigure unpackaged, rendered in realistic style',
        palette: ['#FFD700', '#E31837', '#0055BF'],
        tags: ['LEGO', 'toy', 'packaging'],
      },
      {
        title: 'Action Figure Design',
        description: 'Create custom action figures with accessories.',
        prompt:
          'Make an action figure that features [coffee, laptop, phone and headphones]. Include detailed packaging with character name and themed accessories displayed prominently',
        palette: ['#FF6B35', '#004E89', '#F7B801'],
        tags: ['action', 'figure', 'collectible'],
      },
      {
        title: 'Comic Book Creator',
        description: 'Transform images into compelling comic book strips.',
        prompt:
          'Based on the uploaded image, make a comic book strip, add text bubbles, write a compelling story. Create a superhero comic book style with dynamic panels and action sequences',
        palette: ['#DC143C', '#FFD700', '#000000'],
        tags: ['comic', 'superhero', 'story'],
      },
    ],
  },
  {
    name: 'Photo Editing & Enhancement',
    icon: <Wand2 className="h-5 w-5" />,
    accent: 'from-[#1E3A5F] via-[#3B82F6] to-[#0F172A]',
    prompts: [
      {
        title: 'Old Photo Restoration',
        description: 'Restore and colorize vintage black and white photos.',
        prompt:
          'Restore and colorize this photo. Enhance details, remove scratches and damage, add natural colors based on historical accuracy, improve contrast and clarity',
        palette: ['#8B7355', '#D4A574', '#2C2C2C'],
        tags: ['restore', 'colorize', 'vintage'],
      },
      {
        title: 'OOTD Outfit Swap',
        description: 'Try on different outfits with realistic styling.',
        prompt:
          'Choose the person in Image 1 and dress them in all the clothing and accessories from Image 2. Shoot realistic OOTD-style photos outdoors, using natural lighting, stylish street style, and clear full-body shots',
        palette: ['#FF6B9D', '#4ECDC4', '#FFE66D'],
        tags: ['fashion', 'OOTD', 'outfit'],
      },
      {
        title: 'Multi-View Generator',
        description: 'Generate front, rear, left, right, top, bottom views.',
        prompt:
          'Generate the Front, Rear, Left, Right, Top, Bottom views on white background. Evenly spaced. Consistent subject. Isometric Perspective Equivalence',
        palette: ['#FFFFFF', '#000000', '#808080'],
        tags: ['multi-view', 'technical', '360'],
      },
    ],
  },
  {
    name: 'Creative Transformations',
    icon: <Paintbrush className="h-5 w-5" />,
    accent: 'from-[#4A1942] via-[#D946EF] to-[#1E0A1C]',
    prompts: [
      {
        title: 'Typographic Illustration',
        description: 'Create art using only letters from a phrase.',
        prompt:
          'Create a minimalist black-and-white typographic illustration using only the letters in the phrase [riding a bicycle]. Each letter should be creatively shaped to form the rider, bicycle, and motion. Clean, ultra-minimalist, entirely composed of modified letters',
        palette: ['#000000', '#FFFFFF', '#808080'],
        tags: ['typography', 'minimal', 'creative'],
      },
      {
        title: 'Product Packaging Mock',
        description: 'Apply designs to product packaging with professional photography.',
        prompt:
          'Apply the design from Image 1 to the product in Image 2, and place it in a minimalist design setting with professional photography, studio lighting, clean background',
        palette: ['#FF6B35', '#F7F7F7', '#2C3E50'],
        tags: ['packaging', 'product', 'mockup'],
      },
      {
        title: 'Virtual Makeup Try-On',
        description: 'Apply makeup styles from reference images.',
        prompt:
          'Apply the makeup from Image 2 to the character in Image 1, while maintaining the pose from Image 1. Match colors, techniques, and style accurately',
        palette: ['#FF69B4', '#FFB6C1', '#8B4789'],
        tags: ['makeup', 'beauty', 'virtual'],
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
