import { defineConfig } from 'vite';

// base: './' rende il sito pubblicabile in qualunque sottocartella,
// per esempio https://utente.github.io/flavour-lab/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
