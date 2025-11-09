import { vi } from 'vitest';

// Vitest doesn't define __vite_ssr_exportName__ in some environments, but Next
// app directory modules emit calls to it when exporting metadata. Provide a
// harmless fallback so those modules can be imported during tests.
if (typeof globalThis.__vite_ssr_exportName__ !== 'function') {
  globalThis.__vite_ssr_exportName__ = () => {};
}

// Next.js' dynamic() helper relies on the Next runtime. In tests we only need a
// stable component, so stub it with a synchronous no-op wrapper.
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (factory: () => Promise<any>) => {
    const Component = () => null;
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

// The shared metadata helper depends on Next internals that aren't available in
// the Vitest runtime. Mock it to return a minimal Metadata object for tests.
vi.mock('@repo/seo/metadata', () => ({
  __esModule: true,
  createMetadata: () => ({}),
}));
