import { createMetadata } from '@repo/seo/metadata';
import { Book } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Prompt Library | Promptly Printed',
  description:
    'Explore our collection of AI prompts to create unique custom designs for your apparel.',
});

type Prompt = {
  category: string;
  title: string;
  description: string;
  example: string;
};

const prompts: Prompt[] = [
  {
    category: 'T-Shirts',
    title: 'Minimalist Nature Design',
    description:
      'Create a simple, elegant nature-inspired design suitable for t-shirts.',
    example:
      'A minimalist line drawing of a mountain range at sunset, using only black lines on a white background.',
  },
  {
    category: 'Hoodies',
    title: 'Urban Street Art',
    description: 'Generate a modern street art design perfect for hoodies.',
    example:
      'Abstract graffiti-style lettering with vibrant colors and dynamic shapes.',
  },
  {
    category: 'Kids Wear',
    title: 'Playful Characters',
    description: "Design cute and friendly characters for children's clothing.",
    example: 'A cheerful cartoon dinosaur playing with stars and clouds.',
  },
];

export default function PromptLibraryPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <Book className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="mb-4 font-bold text-4xl tracking-tight">
            Prompt Library
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Explore our curated collection of AI prompts to create unique custom
            designs for your apparel. Use these prompts as inspiration or
            starting points for your own creative projects.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="rounded-lg bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 font-medium text-primary text-sm">
                {prompt.category}
              </div>
              <h3 className="mb-3 font-semibold text-xl">{prompt.title}</h3>
              <p className="mb-4 text-muted-foreground">{prompt.description}</p>
              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 font-medium text-sm">Example Prompt:</h4>
                <p className="text-muted-foreground text-sm">
                  {prompt.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
