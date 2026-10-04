import react from '@vitejs/plugin-react';
import { cpSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    // Keep Stencil's loader and its lazy-loaded modules together.
    {
      name: 'copy-stripe-elements',
      apply: 'build',
      closeBundle() {
        cpSync('node_modules/stripe-pwa-elements/dist/esm', 'build/stripe-pwa-elements/esm', { recursive: true });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['stripe-pwa-elements'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'build',
    target: ['es2020', 'safari15'],
    rolldownOptions: {
      external: ['stripe-pwa-elements/loader'],
      output: {
        paths: { 'stripe-pwa-elements/loader': '/stripe-pwa-elements/esm/loader.js' },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
