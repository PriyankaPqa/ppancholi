/* eslint-disable import/no-extraneous-dependencies */
import {
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import '@testing-library/jest-dom';
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

jest.setTimeout(10000);

async function setRole(role) {
  this.vm.$store.commit('user/setRole', role);
  await this.vm.$nextTick();
}

const plugins = [
  Vuetify,
  Vuex,
  features,
  formatCurrency,
  rolesAndPermissions,
];

export const createLocalVue = () => getLocalVue(plugins);

export const mount = (Component, options) => {
  const wrapper = getWrapper(Component, options, {
    mockStore,
    mockProviderInstance: mockProvider(),
    makeStorage,
    mountMethod: m,
  });
  wrapper.setRole = setRole;
  return wrapper;
};

export const shallowMount = (Component, options) => {
  const wrapper = getWrapper(Component, options, {
    mockStore,
    mockProviderInstance: mockProvider(),
    makeStorage,
    mountMethod: sm,
  });
  wrapper.setRole = setRole;
  return wrapper;
};
