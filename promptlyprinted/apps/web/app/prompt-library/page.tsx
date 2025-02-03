import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { Book } from 'lucide-react';

export const metadata: Metadata = createMetadata({
  title: 'Prompt Library | Promptly Printed',
  description: 'Explore our collection of AI prompts to create unique custom designs for your apparel.',
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
    description: 'Create a simple, elegant nature-inspired design suitable for t-shirts.',
    example: 'A minimalist line drawing of a mountain range at sunset, using only black lines on a white background.',
  },
  {
    category: 'Hoodies',
    title: 'Urban Street Art',
    description: 'Generate a modern street art design perfect for hoodies.',
    example: 'Abstract graffiti-style lettering with vibrant colors and dynamic shapes.',
  },
  {
    category: 'Kids Wear',
    title: 'Playful Characters',
    description: 'Design cute and friendly characters for children\'s clothing.',
    example: 'A cheerful cartoon dinosaur playing with stars and clouds.',
  },
];

export default function PromptLibraryPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Book className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Prompt Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of AI prompts to create unique custom designs
            for your apparel. Use these prompts as inspiration or starting points for
            your own creative projects.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-sm text-primary font-medium mb-2">{prompt.category}</div>
              <h3 className="text-xl font-semibold mb-3">{prompt.title}</h3>
              <p className="text-muted-foreground mb-4">{prompt.description}</p>
              <div className="bg-muted p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Example Prompt:</h4>
                <p className="text-sm text-muted-foreground">{prompt.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 