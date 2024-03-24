import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: ["src/index.ts"],
    external: [
      'zod',
      "@miroir-framework/jzod-ts"
    ],
    output: [
        {
            file: `dist/bundle.js`,
            entryFileNames: "[name].js",
            format: "es",
            exports: "named"
        }
    ],
    plugins: [
      typescript(),
    ],
  },
  {
    input: ["dist/src/index.d.ts"],
    output: [
        {
          file: `dist/bundle.d.ts`,
          format: 'es',
        }
    ],
    plugins: [
      dts(),
    ],
  }
];
