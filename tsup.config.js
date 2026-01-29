import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  "strict": true,
  format: [
    'esm'
  ],
  "dts": true,
  clean: true,
  external: ['typescript', 'fs', 'source-map-support'],
});