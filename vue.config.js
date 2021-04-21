module.exports = {
  css: {
    extract: true,
    loaderOptions: {
      scss: {
        additionalData: '@import "@/styles/index.scss";',
      },
    },
  },
  transpileDependencies: ['vuetify'],
};
