import AnimeSketch from '@/public/lora-images/anime-sketch.png';
import ColoredSketch from '@/public/lora-images/colored-sketch.png';
import Icons from '@/public/lora-images/icons.png';
import LogoDesign from '@/public/lora-images/logo-design.png';
import FluxMidJourney from '@/public/lora-images/midjourney.png';
import PencilSketch from '@/public/lora-images/pencil-sketch.png';
import TarotCard from '@/public/lora-images/tarot-card.png';
import VectorSketch from '@/public/lora-images/vector-sketch.png';
import type { StaticImageData } from 'next/image'; //apps/web/public/lora-images/flux-midjourney.png

export type Lora = {
  id: number;
  name: string;
  model: string;
  description: string;
  url: string;
  image: StaticImageData;
  path: string;
  applyTrigger: (prompt: string) => string;
  scale: number;
  steps: number;
  refinement: string | boolean;
  height?: number;
  width?: number;
  suggestions: { prompt: string; label: string }[];
};

export const LORAS: Lora[] = [
  {
    id: 1,
    name: 'Icons',
    model: 'Flux-Icon-Kit-LoRA',
    description: 'Creates clean, scalable icon designs.',
    url: 'https://huggingface.co/strangerzonehf/Flux-Icon-Kit-LoRA',
    image: Icons,
    path: 'https://huggingface.co/strangerzonehf/Flux-Icon-Kit-LoRA',
    applyTrigger: (prompt) => `icon style, ${prompt}`,
    refinement: 'Refine the prompt for clean, minimalist icon designs.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'App icon', prompt: 'a modern app icon' },
      { label: 'UI element', prompt: 'a UI interface element' },
      { label: 'Symbol', prompt: 'a symbolic representation' },
    ],
  },
  {
    id: 2,
    name: 'Logo Design',
    model: 'FLUX.1-dev-LoRA-Logo-Design',
    description: 'Creates professional logo designs.',
    url: 'https://huggingface.co/Shakker-Labs/FLUX.1-dev-LoRA-Logo-Design',
    image: LogoDesign,
    path: 'https://huggingface.co/Shakker-Labs/FLUX.1-dev-LoRA-Logo-Design',
    applyTrigger: (prompt) => `logo design, ${prompt}`,
    refinement: 'Refine the prompt for professional logo designs.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Company logo', prompt: 'a modern company logo' },
      { label: 'Brand mark', prompt: 'a minimal brand mark' },
      { label: 'Wordmark', prompt: 'an elegant wordmark' },
    ],
  },
  {
    id: 3,
    name: 'Midjourney',
    model: 'Flux-Midjourney-Mix2-LoRA',
    description: "Mimics MidJourney's artistic style.",
    url: 'https://huggingface.co/strangerzonehf/Flux-Midjourney-Mix2-LoRA',
    image: FluxMidJourney,
    path: 'https://huggingface.co/strangerzonehf/Flux-Midjourney-Mix2-LoRA',
    applyTrigger: (prompt) => `MJ style, ${prompt}`,
    refinement: 'Refine the prompt for MidJourney-style artistic renderings.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Landscape', prompt: 'a dramatic landscape' },
      { label: 'Portrait', prompt: 'an artistic portrait' },
      { label: 'Still life', prompt: 'a detailed still life' },
    ],
  },
  {
    id: 4,
    name: 'Tarot Card',
    model: 'flux-tarot-v1',
    description: 'Creates mystical tarot card designs.',
    url: 'https://huggingface.co/multimodalart/flux-tarot-v1',
    image: TarotCard,
    path: 'https://huggingface.co/multimodalart/flux-tarot-v1',
    applyTrigger: (prompt) => `tarot card style, ${prompt}`,
    refinement: 'Refine the prompt for mystical tarot card designs.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Major Arcana', prompt: 'a major arcana card' },
      { label: 'Symbol', prompt: 'a mystical symbol' },
      { label: 'Character', prompt: 'a tarot character' },
    ],
  },
  {
    id: 5,
    name: 'Vector Sketch',
    model: 'vector-illustration',
    description: 'Generates smooth, scalable vector-style sketches.',
    url: 'https://huggingface.co/mujibanget/vector-illustration',
    image: VectorSketch,
    path: 'https://huggingface.co/mujibanget/vector-illustration',
    applyTrigger: (prompt) =>
      `${prompt}, vector illustration with mujibvector style, isolated in a white background`,
    refinement: false,
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Dog', prompt: 'cute dog' },
      { label: 'Flower', prompt: 'a rose' },
      { label: 'Lamp', prompt: 'a vintage lamp' },
    ],
  },
  {
    id: 6,
    name: 'Pencil Sketch',
    model: 'shou_xin',
    description: 'Creates detailed pencil sketch artwork.',
    url: 'https://huggingface.co/Datou1111/shou_xin',
    image: PencilSketch,
    path: 'https://huggingface.co/hassanelmghari/shou_xin',
    applyTrigger: (prompt) => `pencil sketch style, ${prompt}`,
    refinement: 'Refine the prompt for detailed pencil sketch artwork.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Portrait', prompt: 'a detailed portrait' },
      { label: 'Nature', prompt: 'a nature scene' },
      { label: 'Architecture', prompt: 'architectural details' },
    ],
  },
  {
    id: 7,
    name: 'Colored Sketch',
    model: 'Flux-Sketch-Ep-LoRA',
    description: 'Creates vibrant, colorful sketch-style illustrations.',
    url: 'https://huggingface.co/strangerzonehf/Flux-Sketch-Ep-LoRA',
    image: ColoredSketch,
    path: 'https://huggingface.co/strangerzonehf/Flux-Sketch-Ep-LoRA',
    applyTrigger: (prompt) => `ep sketch, ${prompt}`,
    refinement: 'Refine the prompt for vibrant, colorful sketch illustrations.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Portrait', prompt: 'a colorful portrait' },
      { label: 'Landscape', prompt: 'a vibrant landscape' },
      { label: 'Object', prompt: 'a detailed object study' },
    ],
  },
  {
    id: 8,
    name: 'Anime Sketch',
    model: 'anime-blockprint-style',
    description: 'Creates anime-style character illustrations.',
    url: 'https://huggingface.co/glif/anime-blockprint-style',
    image: AnimeSketch,
    path: 'https://huggingface.co/glif/anime-blockprint-style',
    applyTrigger: (prompt) => `anime style, ${prompt}`,
    refinement: 'Refine the prompt for anime-style character illustrations.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Character', prompt: 'a character portrait' },
      { label: 'Scene', prompt: 'a slice of life scene' },
      { label: 'Action', prompt: 'an action pose' },
    ],
  },
];
