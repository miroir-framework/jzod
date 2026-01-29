/// <reference types="vitest" />
import * as path from "path";
import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
  },
  plugins: [
  ],
  test: {
    root: "./tests",
    globals: true,
    watch: false,
    environment: 'node',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});