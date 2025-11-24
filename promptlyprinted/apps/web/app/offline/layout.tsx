import { createMetadata } from '@repo/seo/metadata';
import type { ReactNode } from 'react';

export const metadata = createMetadata({
  title: 'Offline',
  description: 'You appear to be offline. Please check your internet connection.',
});

export default function OfflineLayout({ children }: { children: ReactNode }) {
  return children;
}
