// rollup.config.js
import fs from 'fs';
import path from 'path';
import vue from 'rollup-plugin-vue';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import vuetify from 'rollup-plugin-vuetify';
import bundleScss from 'rollup-plugin-bundle-scss';
import postCss from 'rollup-plugin-postcss';
import analyze from 'rollup-plugin-analyzer';
import minimist from 'minimist';
import babel from 'rollup-plugin-babel';
import del from 'rollup-plugin-delete';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

// Get browserslist config and remove ie from es build targets
const esbrowserslist = fs.readFileSync('./.browserslistrc')
  .toString()
  .split('\n')
  .filter((entry) => entry && entry.substring(0, 2) !== 'ie');

const argv = minimist(process.argv.slice(2));

const projectRoot = path.resolve(__dirname, '..');

const baseConfig = {
  input: 'src/entry.ts',
  plugins: {
    preVue: [
      alias({
        entries: [
          {
            find: '@',
            replacement: `${path.resolve(projectRoot, 'src')}`,
          },
        ],
        customResolver: resolve({
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        }),
      }),
    ],
    replace: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.ES_BUILD': JSON.stringify('false'),
    },
    vue: {
      css: false, // Inject CSS in JavaScript. Setting css: false would extract styles in a .css file
      template: {
        isProduction: true,
      },
    },
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    },
  },
};

// ESM/UMD/IIFE shared settings: externals
// Refer to https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
const external = [
  // list external dependencies, exactly the way it is written in the import statement.
  'vue',
  'vue-i18n',
  'vuetify/lib',
  'awesome-phonenumber',
  'vee-validate', // Rules can be read and defined in host app. Otherwise, we need to define them in the library
  'lodash',
];

// UMD/IIFE shared settings: output.globals
// Refer to https://rollupjs.org/guide/en#output-globals for details
const globals = {
  // Provide global variable names to replace your external imports
  // eg. jquery: '$'
  vue: 'Vue',
};

const esPlugins = [
  del({ targets: 'dist/*' }), // Remove the folder dist. Needs to be only here since the 3 configs are run if no argument are passed
  resolve(), // locates node_module used and add them to the bundle, unless put in external
  replace({
    ...baseConfig.plugins.replace,
    'process.env.ES_BUILD': JSON.stringify('true'),
  }),
  ...baseConfig.plugins.preVue,
  postCss(),
  bundleScss(), // bundle all styles in components into one .scss file, so that users can import it and do some custom theming.
  json(),
  vue(baseConfig.plugins.vue),
  babel({
    ...baseConfig.plugins.babel,
    presets: [
      [
        '@babel/preset-env',
        {
          targets: esbrowserslist,
        },
      ],
    ],
  }),
  vuetify(),
  commonjs(),
  typescript(),
  analyze(),
];

const cjsPlugins = [
  resolve(),
  replace(baseConfig.plugins.replace),
  ...baseConfig.plugins.preVue,
  postCss(),
  bundleScss(),
  json(),
  vue({
    ...baseConfig.plugins.vue,
    template: {
      ...baseConfig.plugins.vue.template,
      optimizeSSR: false,
    },
  }),
  babel(baseConfig.plugins.babel),
  vuetify(),
  commonjs(),
  typescript(),
  analyze(),
];

const iifePlugins = [
  resolve(),
  replace(baseConfig.plugins.replace),
  ...baseConfig.plugins.preVue,
  postCss(),
  bundleScss(),
  json(),
  vue(baseConfig.plugins.vue),
  babel(baseConfig.plugins.babel),
  vuetify(),
  commonjs(),
  typescript(),
  terser({
    output: {
      ecma: 5,
    },
  }),
  analyze(),
];

// Customize configs for individual targets
const buildFormats = [];
if (!argv.format || argv.format === 'es') {
  const esConfig = {
    ...baseConfig,
    external,
    output: {
      file: 'dist/registration-lib.esm.js',
      format: 'esm',
      exports: 'named',
    },
    plugins: esPlugins,
  };
  buildFormats.push(esConfig);
}

if (!argv.format || argv.format === 'cjs') {
  const umdConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: 'dist/registration-lib.ssr.js',
      format: 'cjs',
      name: 'ComponentLibrary',
      exports: 'named',
      globals,
    },
    plugins: cjsPlugins,
  };
  buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === 'iife') {
  const unpkgConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: 'dist/registration-lib.min.js',
      format: 'iife',
      name: 'ComponentLibrary',
      exports: 'named',
      globals,
    },
    plugins: iifePlugins,
  };
  buildFormats.push(unpkgConfig);
}

const styleConfig = {
  input: 'src/styles/index.scss',
  output: {
    file: 'dist/lib.css',
    format: 'es',
    exports: 'default',
  },
  plugins: [
    bundleScss({
      modules: false,
      extract: true,
    }),
  ],
};

buildFormats.push(styleConfig);

// Export config
export default buildFormats;
