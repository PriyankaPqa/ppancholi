/* eslint-disable import/no-extraneous-dependencies */
import {
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import '@/ui/plugins/vee-validate';

import VueI18n from 'vue-i18n';

import { getLocalVue, getWrapper } from '@libs/shared-lib/src/tests/testBase';
import { PiniaVuePlugin } from 'pinia';
import { mockStore } from '../store';
import { mockStorage } from '../store/storage/storage.mock';
import { mockProvider } from '../provider';
import registrationStore from '../ui/plugins/registrationStore';

const plugins = [
  Vuetify,
  Vuex,
  VueI18n,
  PiniaVuePlugin,
  registrationStore,
];

export const createLocalVue = () => getLocalVue(plugins);

export const mount = (Component, options) => getWrapper(Component, options, {
  mockStore,
  mockProviderInstance: mockProvider(),
  makeStorage: null,
  mountMethod: m,
  mockStorage: mockStorage(),
});

export const shallowMount = (Component, options) => getWrapper(Component, options, {
  mockStore,
  mockProviderInstance: mockProvider(),
  makeStorage: null,
  mountMethod: sm,
  mockStorage: mockStorage(),
});
