/* eslint-disable import/no-extraneous-dependencies */
import {
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import '@testing-library/jest-dom';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import '@/ui/plugins/vee-validate';

import VueI18n from 'vue-i18n';

import { getLocalVue, getWrapper } from '@libs/shared-lib/tests/testBase';
import { mockStore } from '../store';
import { mockStorage } from '../store/storage/storage.mock';
import { mockProvider } from '../provider';

const plugins = [
  Vuetify,
  Vuex,
  VueI18n,
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
