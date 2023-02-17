/* eslint-disable import/no-extraneous-dependencies */
import {
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import Vuetify from 'vuetify';
import '@/ui/plugins/vee-validate';

import VueI18n from 'vue-i18n';

import { getLocalVue, getWrapper } from '@libs/shared-lib/src/tests/testBase';
import { PiniaVuePlugin } from 'pinia';
import { mockProvider } from '../provider';
import registrationStore from '../ui/plugins/registrationStore';

const plugins = [
  Vuetify,
  VueI18n,
  PiniaVuePlugin,
  registrationStore,
];

export const createLocalVue = () => getLocalVue(plugins);

export const mount = (Component, options) => getWrapper(Component, options, {
  mockProviderInstance: mockProvider(),
  mountMethod: m,
});

export const shallowMount = (Component, options) => getWrapper(Component, options, {
  mockProviderInstance: mockProvider(),
  mountMethod: sm,
});
