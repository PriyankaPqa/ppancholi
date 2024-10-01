import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import vue from '@vitejs/plugin-vue2';
// import eslintPlugin from 'vite-plugin-eslint';
// eslint-disable-next-line import/no-unresolved
import Components from 'unplugin-vue-components/vite';
import Inspector from 'vite-plugin-vue-inspector';
import path from 'path';

const isTemporaryBranch = (env) => env.VITE_TEMP_BRANCH_ID !== '' && env.VITE_TEMP_BRANCH_ID !== '#{VITE_TEMP_BRANCH_ID}#';

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

  const options = {
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
      Inspector({
        vue: 2,
      }),
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
          // This block is used by Vite to load our variables in every scss file (and SFC files)
          additionalData: [
            '@import "vuetify/src/styles/settings/_variables.scss";',
            '@import "@libs/shared-lib/assets/styles/rctech_variables.scss";',
            '',
          ].join('\n'),
        },
        sass: {
          // This block is used by Vuetify ONLY, to load the overrides into its components (VBtn and so on)
          additionalData: [
            // vuetify variable overrides
            '@import "vuetify/src/styles/settings/_variables.scss"',
            '@import "@libs/shared-lib/assets/styles/rctech_variables.scss"',
            '',
          ].join('\n'),
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
        '@libs/cypress-lib': path.resolve(__dirname, '../../libs/cypress-lib/src'),
        '@libs/assets': path.resolve(__dirname, '../../libs/assets'),
        'devextreme/ui': 'devextreme/esm/ui',
      },
    },
    define: envWithProcessPrefix,
  };

  if (isTemporaryBranch(env)) {
    return {
      ...options,
      build: {
        assetsDir: env.VITE_TEMP_BRANCH_ID,
      },
    };
  }

  return options;
});
