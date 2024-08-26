/**
 * ⚠️ This is a configuration for Cypress to preprocess files using Webpack v4.
 * Do not upgrade to Webpack v5 unless there is a compelling reason.
 * Upgrading to Webpack v5 would require manually adding polyfills for certain dependencies, as they are no longer included by default.
 * Since we are using Webpack v4, it's crucial to ensure that `ts-loader` and `babel-loader` versions remain compatible with v4.
 * Specifically, use `ts-loader` and `babel-loader` versions 8.x.x, not 9.x.x.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    plugins: [new TsconfigPathsPlugin({/* options: see below */})],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        }],
      },
    ],
  },
};
