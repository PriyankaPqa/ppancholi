// eslint-disable-next-line import/no-extraneous-dependencies
import { configure, addDecorator } from '@storybook/vue';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!style-loader!css-loader!sass-loader!./scss-loader.scss';

import Vue from 'vue';
import Vuetify from 'vuetify';

import { options } from '@/plugins/vuetify/vuetify';
import { i18n } from '@/plugins/i18n';

Vue.use(Vuetify);

const vuetify = new Vuetify(options);

addDecorator(() => ({
  vuetify,
  i18n,
  template:
    '<v-app style="background-color: white; max-height: 600px"><v-main><story/></v-main></v-app>',
}));

// automatically import all files ending in *.stories.js
configure(require.context('../../src/stories', true, /\.stories\.js$/), module);
