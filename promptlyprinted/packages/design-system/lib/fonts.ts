import { cn } from '@repo/design-system/lib/utils';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Outfit } from 'next/font/google';

const outfitFont = Outfit({
  subsets: ['latin'],
  variable: '--font-precious-sans'
});

export const fonts = cn(
  GeistSans.variable,
  GeistMono.variable,
  outfitFont.variable,
  'touch-manipulation font-sans antialiased'
);
