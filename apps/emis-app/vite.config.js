import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import vue from '@vitejs/plugin-vue2';
// import eslintPlugin from 'vite-plugin-eslint';
// eslint-disable-next-line import/no-unresolved
import Components from 'unplugin-vue-components/vite';

import path from 'path';

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  // expose .env as process.env instead of import.meta since jest does not import meta yet
  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => ({
      ...prev,
      [`process.env.${key}`]: `"${val}"`,
    }),
    {},
  );

  return {
    server: {
      port: 8080,
    },
    preview: {
      port: 8080,
    },
    plugins: [
      vue(),
      // eslintPlugin(),
      splitVendorChunkPlugin(),
      Components({
        dirs: [
          'src',
          '../../libs/component-lib/src/components',
          '../../libs/registration-lib/src/components',
        ],
        resolvers: [
          {
            type: 'component',
            // eslint-disable-next-line consistent-return
            resolve: (name) => {
              const blackList = [
                'VAutocompleteWithValidation',
                'VCheckboxWithValidation',
                'VComboBoxWithValidation',
                'VDateFieldWithValidation',
                'VPasswordWithValidation',
                'VSelectWithValidation',
                'VTextAreaWithValidation',
                'VTextFieldWithValidation',
              ];
              if (name.match(/^V[A-Z]/) && !blackList.includes(name)) {
                return { name, from: 'vuetify/lib' };
              }
            },
          },
        ],
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "@libs/shared-lib/assets/styles/rctech_variables.scss";
        `,
        },
      },
    },
    resolve: {
      // extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@libs/registration-lib': path.resolve(__dirname, '../../libs/registration-lib/src'),
        '@libs/component-lib': path.resolve(__dirname, '../../libs/component-lib/src'),
        '@libs/shared-lib': path.resolve(__dirname, '../../libs/shared-lib/src'),
        '@libs/entities-lib': path.resolve(__dirname, '../../libs/entities-lib/src'),
        '@libs/stores-lib': path.resolve(__dirname, '../../libs/stores-lib/src'),
        '@libs/services-lib': path.resolve(__dirname, '../../libs/services-lib/src'),
        '@libs/assets': path.resolve(__dirname, '../../libs/assets'),
      },
    },
    define: envWithProcessPrefix,
  };
});
