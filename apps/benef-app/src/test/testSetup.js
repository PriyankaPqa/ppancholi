/* eslint-disable import/no-extraneous-dependencies */
import {
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import '@/ui/plugins/vee-validate';
import VueI18n from 'vue-i18n';
import features from '@/ui/plugins/features';
import { mockStore } from '@/store';
import { makeStorage } from '@/storage';
import { getLocalVue, getWrapper } from '@libs/shared-lib/tests/testBase';
import { mockProvider } from '@/services/provider';

jest.setTimeout(10000);

const plugins = [
  Vuetify,
  Vuex,
  features,
  VueI18n,
];

export const createLocalVue = () => getLocalVue(plugins);

export const mount = (Component, options) => getWrapper(Component, options, {
  mockStore,
  mockProviderInstance: mockProvider(),
  makeStorage,
  mountMethod: m,
});

export const shallowMount = (Component, options) => getWrapper(Component, options, {
  mockStore,
  mockProviderInstance: mockProvider(),
  makeStorage,
  mountMethod: sm,
});
