const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const base = require('../../vue.config');

module.exports = {
  ...base,
  configureWebpack: {
    ...base.configureWebpack,
    resolve: {
      plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@libs/registration-lib': path.resolve(__dirname, '../../libs/registration-lib/src'),
        '@libs/component-lib': path.resolve(__dirname, '../../libs/component-lib/src'),
        '@libs/core-lib': path.resolve(__dirname, '../../libs/core-lib/src'),
        '@libs/assets': path.resolve(__dirname, '../../libs/assets'),
      },
    },
  },
};
