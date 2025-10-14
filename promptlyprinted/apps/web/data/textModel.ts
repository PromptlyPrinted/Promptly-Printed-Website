import AnimeSketch from '@/public/lora-images/anime-sketch.png';
import ColoredSketch from '@/public/lora-images/colored-sketch.png';
import Icons from '@/public/lora-images/icons.png';
import FluxMidJourney from '@/public/lora-images/midjourney.png';
import PencilSketch from '@/public/lora-images/pencil-sketch.png';
import TarotCard from '@/public/lora-images/tarot-card.png';
import VectorSketch from '@/public/lora-images/vector-sketch.png';
import SyntheticAnime from '@/public/lora-images/synthetic-anime.png';
import SoftServe from '@/public/lora-images/soft-serve.png';
import ReplicateFlux from '@/public/lora-images/replicate-flux.png';
import RetroFuturism from '@/public/lora-images/retro-futurism.png';
import YarnArt from '@/public/lora-images/yarn-art.png';
import FrostingLane from '@/public/lora-images/frosting-lane.png';
import HalfIllustration from '@/public/lora-images/half-illustration.png';

// Kontext LORA images
import Chibi3D from '@/public/kontext-lora-images/3dchibi.png';
import AmericanCartoon from '@/public/kontext-lora-images/americancartoon.png';
import ChineseInk from '@/public/kontext-lora-images/chineseink.png';
import ClayToy from '@/public/kontext-lora-images/claytoy.png';
import Fabric from '@/public/kontext-lora-images/fabric.png';
import Ghibli from '@/public/kontext-lora-images/ghibli.png';
import Irasutoya from '@/public/kontext-lora-images/irasutoya.png';
import Jojo from '@/public/kontext-lora-images/jojo.png';
import OilPainting from '@/public/kontext-lora-images/oilpainting.png';
import Pixel from '@/public/kontext-lora-images/pixel.png';
import Snoopy from '@/public/kontext-lora-images/snoopy.png';
import Poly from '@/public/kontext-lora-images/poly.png';
import Lego from '@/public/kontext-lora-images/lego.png';
import Origami from '@/public/kontext-lora-images/origami.png';
import PopArt from '@/public/kontext-lora-images/popart.png';
import VanGogh from '@/public/kontext-lora-images/vangogh.png';
import PaperCutting from '@/public/kontext-lora-images/papercutting.png';
import Line from '@/public/kontext-lora-images/line.png';
import Vector from '@/public/kontext-lora-images/vector.png';
import Picasso from '@/public/kontext-lora-images/picasso.png';
import Macaron from '@/public/kontext-lora-images/macaron.png';
import RickMorty from '@/public/kontext-lora-images/rickmorty.png';

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
    name: 'Synthetic Anime',
    model: 'FLUX-SyntheticAnime',
    description: 'Creates synthetic anime-style illustrations.',
    url: 'https://huggingface.co/dataautogpt3/FLUX-SyntheticAnime',
    image: SyntheticAnime,
    path: 'https://huggingface.co/dataautogpt3/FLUX-SyntheticAnime',
    applyTrigger: (prompt) => `synthetic anime style, ${prompt}`,
    refinement: 'Refine the prompt for synthetic anime-style illustrations.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Character', prompt: 'an anime character portrait' },
      { label: 'Scene', prompt: 'an anime background scene' },
      { label: 'Action', prompt: 'a dynamic action pose' },
    ],
  },
  {
    id: 2,
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
  {
    id: 3,
    name: 'Soft Serve',
    model: 'softserve_anime',
    description: 'Creates soft, dreamy anime-style artwork.',
    url: 'https://huggingface.co/alvdansen/softserve_anime',
    image: SoftServe,
    path: 'https://huggingface.co/alvdansen/softserve_anime',
    applyTrigger: (prompt) => `soft serve anime style, ${prompt}`,
    refinement: 'Refine the prompt for soft, dreamy anime-style artwork.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Portrait', prompt: 'a soft dreamy portrait' },
      { label: 'Pastel scene', prompt: 'a pastel colored scene' },
      { label: 'Cute character', prompt: 'a cute anime character' },
    ],
  },
  {
    id: 4,
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
    id: 5,
    name: 'Replicate Flux',
    model: 'ReplicateFluxLoRA',
    description: 'Creates high-quality Flux-style images.',
    url: 'https://huggingface.co/lucataco/ReplicateFluxLoRA',
    image: ReplicateFlux,
    path: 'https://huggingface.co/lucataco/ReplicateFluxLoRA',
    applyTrigger: (prompt) => `flux style, ${prompt}`,
    refinement: 'Refine the prompt for high-quality Flux-style images.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Artistic', prompt: 'an artistic composition' },
      { label: 'Detailed', prompt: 'a highly detailed scene' },
      { label: 'Creative', prompt: 'a creative concept' },
    ],
  },
  {
    id: 6,
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
    id: 9,
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
    id: 10,
    name: 'Retro Futurism',
    model: 'retrofuturism-flux',
    description: 'Creates retro-futuristic sci-fi artwork.',
    url: 'https://huggingface.co/martintomov/retrofuturism-flux',
    image: RetroFuturism,
    path: 'https://huggingface.co/martintomov/retrofuturism-flux',
    applyTrigger: (prompt) => `retrofuturism style, ${prompt}`,
    refinement: 'Refine the prompt for retro-futuristic sci-fi artwork.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Sci-fi scene', prompt: 'a retro sci-fi scene' },
      { label: 'Future tech', prompt: 'vintage future technology' },
      { label: 'Space age', prompt: 'a space age design' },
    ],
  },
  {
    id: 11,
    name: 'Frosting Lane',
    model: 'frosting_lane_flux',
    description: 'Creates sweet, frosting-like artwork with pastel colors.',
    url: 'https://huggingface.co/alvdansen/frosting_lane_flux',
    image: FrostingLane,
    path: 'https://huggingface.co/alvdansen/frosting_lane_flux',
    applyTrigger: (prompt) => `frosting lane style, ${prompt}`,
    refinement: 'Refine the prompt for sweet, frosting-like artwork.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Sweet design', prompt: 'a sweet pastel design' },
      { label: 'Candy-like', prompt: 'a candy-colored scene' },
      { label: 'Dreamy', prompt: 'a dreamy frosted aesthetic' },
    ],
  },
  {
    id: 12,
    name: 'Half Illustration',
    model: 'half_illustration',
    description: 'Creates half-illustrated, half-realistic artwork.',
    url: 'https://huggingface.co/davisbro/half_illustration',
    image: HalfIllustration,
    path: 'https://huggingface.co/davisbro/half_illustration',
    applyTrigger: (prompt) => `half illustration style, ${prompt}`,
    refinement: 'Refine the prompt for half-illustrated artwork.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Mixed media', prompt: 'a mixed media composition' },
      { label: 'Artistic blend', prompt: 'an artistic blend of styles' },
      { label: 'Unique look', prompt: 'a unique illustrated look' },
    ],
  },
  {
    id: 13,
    name: 'Yarn Art',
    model: 'yarn_art_Flux_LoRA',
    description: 'Creates artwork that looks like yarn or textile art.',
    url: 'https://huggingface.co/linoyts/yarn_art_Flux_LoRA',
    image: YarnArt,
    path: 'https://huggingface.co/linoyts/yarn_art_Flux_LoRA',
    applyTrigger: (prompt) => `yarn art style, ${prompt}`,
    refinement: 'Refine the prompt for yarn or textile art style.',
    scale: 1,
    steps: 28,
    suggestions: [
      { label: 'Knitted', prompt: 'a knitted texture design' },
      { label: 'Textile art', prompt: 'textile art composition' },
      { label: 'Cozy design', prompt: 'a cozy yarn design' },
    ],
  },
  {
    id: 14,
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
];

export type KontextLora = {
  id: number;
  name: string;
  description: string;
  safetensorFileName: string;
  image: StaticImageData;
  applyTrigger: (prompt: string) => string;
  scale: number;
  steps: number;
  suggestions: { prompt: string; label: string }[];
};

export const KONTEXT_LORAS: KontextLora[] = [
  {
    id: 1001,
    name: 'Ghibli',
    description: 'Converts images to Studio Ghibli animation style.',
    safetensorFileName: 'Ghibli_lora_weights.safetensors',
    image: Ghibli,
    applyTrigger: (prompt) => `Turn this image into the Ghibli style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Miyazaki style', prompt: 'Make it like Hayao Miyazaki film' },
      { label: 'Fantasy world', prompt: 'Transform into Ghibli fantasy setting' },
      { label: 'Magical realism', prompt: 'Create magical Ghibli atmosphere' },
    ],
  },
  {
    id: 1002,
    name: '3D Chibi',
    description: 'Transforms images into cute 3D chibi style characters.',
    safetensorFileName: '3D_Chibi_lora_weights.safetensors',
    image: Chibi3D,
    applyTrigger: (prompt) => `Turn this image into the 3D Chibi style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Cute character', prompt: 'Make it extra cute and chibi-like' },
      { label: 'Anime style', prompt: 'Convert to anime chibi character' },
      { label: 'Kawaii version', prompt: 'Transform into kawaii 3D style' },
    ],
  },
  {
    id: 1003,
    name: 'American Cartoon',
    description: 'Converts images to American cartoon animation style.',
    safetensorFileName: 'American_Cartoon_lora_weights.safetensors',
    image: AmericanCartoon,
    applyTrigger: (prompt) => `Turn this image into the American Cartoon style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Disney style', prompt: 'Make it look like Disney animation' },
      { label: 'Comic book', prompt: 'Transform into comic book style' },
      { label: 'Animated series', prompt: 'Convert to TV cartoon style' },
    ],
  },
  {
    id: 1004,
    name: 'Pixel',
    description: 'Converts images to retro pixel art style.',
    safetensorFileName: 'Pixel_lora_weights.safetensors',
    image: Pixel,
    applyTrigger: (prompt) => `Turn this image into the Pixel style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: '8-bit game', prompt: 'Make it look like 8-bit video game' },
      { label: 'Retro gaming', prompt: 'Transform into retro game sprite' },
      { label: 'Pixelated art', prompt: 'Create detailed pixel art' },
    ],
  },
  {
    id: 1005,
    name: 'LEGO',
    description: 'Transforms images to look like LEGO brick constructions.',
    safetensorFileName: 'LEGO_lora_weights.safetensors',
    image: Lego,
    applyTrigger: (prompt) => `Turn this image into the LEGO style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Brick build', prompt: 'Make it look built from LEGO bricks' },
      { label: 'Toy version', prompt: 'Transform into LEGO toy set' },
      { label: 'Blocky style', prompt: 'Create blocky LEGO aesthetic' },
    ],
  },
  {
    id: 1006,
    name: 'Clay Toy',
    description: 'Converts images to look like clay toy figurines.',
    safetensorFileName: 'Clay_Toy_lora_weights.safetensors',
    image: ClayToy,
    applyTrigger: (prompt) => `Turn this image into the Clay Toy style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Plasticine', prompt: 'Make it look like plasticine sculpture' },
      { label: 'Stop motion', prompt: 'Transform into stop-motion character' },
      { label: 'Handmade', prompt: 'Create handmade clay figure look' },
    ],
  },
  {
    id: 1007,
    name: 'Oil Painting',
    description: 'Transforms images into classical oil painting style.',
    safetensorFileName: 'Oil_Painting_lora_weights.safetensors',
    image: OilPainting,
    applyTrigger: (prompt) => `Turn this image into the Oil Painting style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Renaissance', prompt: 'Make it like Renaissance painting' },
      { label: 'Impressionist', prompt: 'Transform into impressionist style' },
      { label: 'Classical art', prompt: 'Create classical oil painting' },
    ],
  },
  {
    id: 1008,
    name: 'Van Gogh',
    description: 'Converts images to Vincent van Gogh painting style.',
    safetensorFileName: 'Van_Gogh_lora_weights.safetensors',
    image: VanGogh,
    applyTrigger: (prompt) => `Turn this image into the Van Gogh style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Swirling brushstrokes', prompt: 'Use Van Gogh swirling style' },
      { label: 'Post-impressionist', prompt: 'Create post-impressionist painting' },
      { label: 'Expressive strokes', prompt: 'Make expressive brushwork' },
    ],
  },
  {
    id: 1009,
    name: 'Pop Art',
    description: 'Transforms images into pop art style with bold colors.',
    safetensorFileName: 'Pop_Art_lora_weights.safetensors',
    image: PopArt,
    applyTrigger: (prompt) => `Turn this image into the Pop Art style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Warhol style', prompt: 'Make it like Andy Warhol artwork' },
      { label: 'Bold colors', prompt: 'Use bold pop art colors' },
      { label: 'Comic style', prompt: 'Create comic pop art effect' },
    ],
  },
  {
    id: 1010,
    name: 'Rick & Morty',
    description: 'Converts images to Rick and Morty animation style.',
    safetensorFileName: 'Rick_Morty_lora_weights.safetensors',
    image: RickMorty,
    applyTrigger: (prompt) => `Turn this image into the Rick Morty style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Cartoon style', prompt: 'Make it like Rick and Morty cartoon' },
      { label: 'Sci-fi comedy', prompt: 'Add sci-fi comedy elements' },
      { label: 'Adult animation', prompt: 'Create adult animation style' },
    ],
  },
  {
    id: 1011,
    name: 'Vector',
    description: 'Transforms images into clean vector graphic style.',
    safetensorFileName: 'Vector_lora_weights.safetensors',
    image: Vector,
    applyTrigger: (prompt) => `Turn this image into the Vector style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Flat design', prompt: 'Create flat vector design' },
      { label: 'Clean graphics', prompt: 'Make clean vector graphics' },
      { label: 'Logo style', prompt: 'Transform into logo vector art' },
    ],
  },
  {
    id: 1012,
    name: 'Line',
    description: 'Converts images to clean line art style.',
    safetensorFileName: 'Line_lora_weights.safetensors',
    image: Line,
    applyTrigger: (prompt) => `Turn this image into the Line style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Minimal lines', prompt: 'Use minimal clean line art' },
      { label: 'Sketch style', prompt: 'Create sketch line drawing' },
      { label: 'Continuous line', prompt: 'Make continuous line art' },
    ],
  },
  {
    id: 1013,
    name: 'Poly',
    description: 'Converts images to low-poly 3D geometric style.',
    safetensorFileName: 'Poly_lora_weights.safetensors',
    image: Poly,
    applyTrigger: (prompt) => `Turn this image into the Poly style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Low-poly 3D', prompt: 'Make it low-poly geometric' },
      { label: 'Faceted design', prompt: 'Create faceted crystal look' },
      { label: 'Modern geometric', prompt: 'Transform into modern geometry' },
    ],
  },
  {
    id: 1014,
    name: 'Origami',
    description: 'Converts images to look like paper origami art.',
    safetensorFileName: 'Origami_lora_weights.safetensors',
    image: Origami,
    applyTrigger: (prompt) => `Turn this image into the Origami style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Paper fold', prompt: 'Make it look like folded paper' },
      { label: 'Geometric folds', prompt: 'Emphasize geometric paper folds' },
      { label: 'Minimalist paper', prompt: 'Create clean origami design' },
    ],
  },
  {
    id: 1015,
    name: 'Jojo',
    description: 'Converts images to JoJo\'s Bizarre Adventure anime style.',
    safetensorFileName: 'Jojo_lora_weights.safetensors',
    image: Jojo,
    applyTrigger: (prompt) => `Turn this image into the Jojo style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Dramatic pose', prompt: 'Make it dramatic and powerful' },
      { label: 'Muscle definition', prompt: 'Emphasize muscular features' },
      { label: 'Bold style', prompt: 'Create bold manga aesthetic' },
    ],
  },
  {
    id: 1016,
    name: 'Picasso',
    description: 'Converts images to Pablo Picasso cubist style.',
    safetensorFileName: 'Picasso_lora_weights.safetensors',
    image: Picasso,
    applyTrigger: (prompt) => `Turn this image into the Picasso style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Cubist style', prompt: 'Make it cubist abstract art' },
      { label: 'Fragmented', prompt: 'Create fragmented perspective' },
      { label: 'Abstract faces', prompt: 'Transform into abstract portrait' },
    ],
  },
  {
    id: 1017,
    name: 'Chinese Ink',
    description: 'Transforms images into traditional Chinese ink painting style.',
    safetensorFileName: 'Chinese_Ink_lora_weights.safetensors',
    image: ChineseInk,
    applyTrigger: (prompt) => `Turn this image into the Chinese Ink style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Watercolor', prompt: 'Make it like traditional watercolor painting' },
      { label: 'Brush strokes', prompt: 'Emphasize artistic brush strokes' },
      { label: 'Minimalist', prompt: 'Create minimalist ink art' },
    ],
  },
  {
    id: 1018,
    name: 'Irasutoya',
    description: 'Transforms images into Japanese Irasutoya illustration style.',
    safetensorFileName: 'Irasutoya_lora_weights.safetensors',
    image: Irasutoya,
    applyTrigger: (prompt) => `Turn this image into the Irasutoya style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Simple illustration', prompt: 'Make it simple and friendly' },
      { label: 'Kawaii design', prompt: 'Transform into cute kawaii style' },
      { label: 'Clean vector', prompt: 'Create clean vector illustration' },
    ],
  },
  {
    id: 1019,
    name: 'Snoopy',
    description: 'Transforms images into Peanuts/Snoopy comic strip style.',
    safetensorFileName: 'Snoopy_lora_weights.safetensors',
    image: Snoopy,
    applyTrigger: (prompt) => `Turn this image into the Snoopy style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Comic strip', prompt: 'Make it like Peanuts comic strip' },
      { label: 'Simple lines', prompt: 'Use simple clean line art' },
      { label: 'Wholesome', prompt: 'Create wholesome cartoon style' },
    ],
  },
  {
    id: 1020,
    name: 'Paper Cutting',
    description: 'Transforms images to look like paper cut art.',
    safetensorFileName: 'Paper_Cutting_lora_weights.safetensors',
    image: PaperCutting,
    applyTrigger: (prompt) => `Turn this image into the Paper Cutting style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Layered paper', prompt: 'Create layered paper cut effect' },
      { label: 'Silhouette art', prompt: 'Make silhouette paper cutting' },
      { label: 'Shadow box', prompt: 'Transform into shadow box art' },
    ],
  },
  {
    id: 1021,
    name: 'Fabric',
    description: 'Transforms images to appear as if made from fabric or textile.',
    safetensorFileName: 'Fabric_lora_weights.safetensors',
    image: Fabric,
    applyTrigger: (prompt) => `Turn this image into the Fabric style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Quilted', prompt: 'Make it look like quilted fabric art' },
      { label: 'Embroidered', prompt: 'Transform into embroidery design' },
      { label: 'Textile art', prompt: 'Create textile artwork appearance' },
    ],
  },
  {
    id: 1022,
    name: 'Macaron',
    description: 'Transforms images to look like colorful macaron pastries.',
    safetensorFileName: 'Macaron_lora_weights.safetensors',
    image: Macaron,
    applyTrigger: (prompt) => `Turn this image into the Macaron style. ${prompt}`,
    scale: 1.0,
    steps: 24,
    suggestions: [
      { label: 'Pastel colors', prompt: 'Use soft pastel macaron colors' },
      { label: 'Sweet aesthetic', prompt: 'Create sweet dessert aesthetic' },
      { label: 'Kawaii food', prompt: 'Make kawaii food style' },
    ],
  },
];
