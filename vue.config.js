const path = require('path');
const webpack = require('webpack');

module.exports = {
  productionSourceMap: false, // Remove dev tools mapping
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: true, // Open the tab with bundle analyzer
      analyzerMode: 'disabled',
      generateStatsFile: false,
    },
  },
  configureWebpack: {
    entry: path.resolve(__dirname, 'src/main.ts'),
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            maxInitialRequests: Infinity,
            minSize: 0,
            name(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
              )[1];

              // npm package names are URL-safe, but some servers don"t like @ symbols
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      },
    },
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ],
  },
  transpileDependencies: [
    'vuetify',
  ],
  css: {
    loaderOptions: {
      scss: {
        // Here we can use the newer SCSS flavor of Sass.
        // Note that there *is* a semicolon at the end of the below line
        additionalData: `
          @import "@/ui/styles/rctech_variables.scss";
        `,
      },
    },
  },
};
/* eslint-enable */
