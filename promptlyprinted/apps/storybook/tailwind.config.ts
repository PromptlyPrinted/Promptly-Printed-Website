import { config as baseConfig } from '@repo/tailwind-config/config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...baseConfig,
  content: [
    ...(Array.isArray(baseConfig.content) ? baseConfig.content : []),
    './.storybook/preview.tsx',
    './stories/**/*.{ts,tsx,mdx}',
  ],
};

export default config;
