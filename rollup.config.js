// import typescript from 'rollup-plugin-typescript2';
// import dts from 'rollup-plugin-dts';
// import commonjs from '@rollup/plugin-commonjs';
// import nodeResolve from '@rollup/plugin-node-resolve';

// export default [
//   {
//     input: ["src/index.ts"],
//     external: [
//       'zod',
//       "@miroir-framework/jzod-ts",
//       "url",
//       "worker_threads",
//       "path",
//       "zod-to-ts",
//     ],
//     output: [
//         {
//             file: `dist/bundle.js`,
//             entryFileNames: "[name].js",
//             format: "es",
//             exports: "named"
//         }
//     ],
//     plugins: [
//       typescript(),
//     ],
//   },
//   {
//     input: 'src/worker.ts',
//     output: {
//       file: 'dist/worker.js',
//       format: 'cjs',
//     },
//     plugins: [nodeResolve(), commonjs(), typescript()],
//     // plugins: [resolve(), commonjs(), typescript()],
//   },
//   {
//     input: ["dist/src/index.d.ts"],
//     output: [
//         {
//           file: `dist/bundle.d.ts`,
//           format: 'es',
//         }
//     ],
//     plugins: [
//       dts(),
//     ],
//   }
// ];
