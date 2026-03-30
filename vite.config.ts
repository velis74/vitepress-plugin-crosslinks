/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    {
      ...eslint({
        failOnWarning: false,
        failOnError: false,
      }),
      apply: 'serve',
      enforce: 'post',
    },
    dts({
      rollupTypes: true,
      exclude: ['**/*.spec.ts'],
    }),
    visualizer({
      open: false,
      filename: 'coverage/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions: [
      '.js',
      '.mjs',
      '.ts',
    ],
  },
  build: {
    target: 'es2015',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['umd', 'es'],
      fileName: 'vitepress-plugin-crosslinks',
      name: 'vitepress-plugin-crosslinks',
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'src/index.ts',
        'src/types.ts',
        'src/env-loader.ts',
        'src/markdown-plugin.ts',
      ],
      exclude: [
        '**/index.ts',
      ],
    },
    globals: true,
    include: [
      'src/env-loader.spec.ts',
      'src/markdown-plugin.spec.ts',
    ],
  },
});
