import '@mdi/font/css/materialdesignicons.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css';

import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import light from './light-theme';
import dark from './dark-theme';

Vue.use(Vuetify);

export const options = {
  theme: {
    options: {
      customProperties: true, // generate a css variable for each theme color, which you can then use in your components' <style> blocks.
    },
    themes: {
      light,
      dark,
    },
  },
  icons: {
    iconfont: 'mdi',
  },
};

export default new Vuetify(options);
