// import { sassPlugin } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  "target": "es2020",
  "module": "es2020",
  "strict": true,
  format: ['esm'],
  // sourcemap: true,
  clean: true,
  bundle: true,
  dts: true,
  // "allowSyntheticDefaultImports": true,
  // esModuleInterop: true,
  // splitting: true,
  // minify: true,
  // external: ['esbuild', 'fs'],
  banner(ctx) {
    if (ctx.format === "esm") {
      return {
        js: `
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
`,
      };
    }
  }
});