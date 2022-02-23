const path = require('path');
const base = require('../../vue.config');

module.exports = {
  ...base,
  configureWebpack: {
    ...base.configureWebpack,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@libs/registration-lib': path.resolve(__dirname, '../../libs/registration-lib/src'),
      },
    },
  },
};
