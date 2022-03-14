import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import light from './light-theme';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify);

export const options = {
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light,
    },
  },
  icons: {
    iconfont: 'mdi' as never,
  },
};

export default new Vuetify(options);
