/* eslint-disable import/no-extraneous-dependencies */
import {
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import '@/ui/plugins/vee-validate';
import formatCurrency from '@/ui/plugins/formatCurrency';
import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import features from '@/ui/plugins/features';
import { mockStore } from '@/store';
import { makeStorage } from '@/storage';
import { mockProvider } from '@/services/provider';
import { getLocalVue, getWrapper } from '@libs/shared-lib/tests/testBase';
import { PiniaVuePlugin } from 'pinia';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import registrationStore from '@/ui/plugins/registrationStore';

jest.setTimeout(10000);

const plugins = [
  Vuetify,
  Vuex,
  features,
  formatCurrency,
  rolesAndPermissions,
  PiniaVuePlugin,
  registrationStore,
];

export const createLocalVue = () => getLocalVue(plugins);

export const mount = (Component, options) => {
  const opts = {
    pinia: getPiniaForUser('level6'),
    ...options,
  };
  const wrapper = getWrapper(Component, opts, {
    mockStore,
    mockProviderInstance: mockProvider(),
    makeStorage,
    mountMethod: m,
  });
  return wrapper;
};

export const shallowMount = (Component, options) => {
  const opts = {
    pinia: getPiniaForUser('level6'),
    ...options,
  };
  const wrapper = getWrapper(Component, opts, {
    mockStore,
    mockProviderInstance: mockProvider(),
    makeStorage,
    mountMethod: sm,
  });
  return wrapper;
};
