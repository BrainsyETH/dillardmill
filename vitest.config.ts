import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // PGlite (real Postgres in WASM) takes a few seconds to start per database.
    testTimeout: 30_000,
  },
});
