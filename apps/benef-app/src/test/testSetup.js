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
import { getLocalVue, getWrapper } from '@libs/shared-lib/tests/testBase';
import { mockProvider } from '@/services/provider';
import { createPinia, PiniaVuePlugin, setActivePinia } from 'pinia';
import registrationStore from '@/ui/plugins/registrationStore';

jest.setTimeout(10000);

// To make sure pinia is injected before using registrationStore
setActivePinia(createPinia());

const plugins = [
  Vuetify,
  Vuex,
  features,
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
