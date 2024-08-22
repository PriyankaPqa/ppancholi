import { defineConfig, mergeConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import commonjs from 'vite-plugin-commonjs';

import viteConfig from './vite.config';

export default defineConfig((env) => mergeConfig(
  viteConfig(env),
  defineConfig({
    plugins: [
      nodePolyfills(),
      commonjs(),
    ],
  }),
));
