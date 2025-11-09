const path = require('node:path');
const react = require('@vitejs/plugin-react');
const { defineConfig } = require('vitest/config');

const config = defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  test: {
    environment: 'jsdom',
    deps: {
      registerNodeLoader: true,
    },
    setupFiles: [path.resolve(__dirname, './setup.ts')],
  },
  resolve: {
    alias: {
      '@': process.cwd(),
      '@repo': path.resolve(__dirname, '../../packages'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});

module.exports = config;
