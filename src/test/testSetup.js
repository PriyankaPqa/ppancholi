/* eslint-disable import/no-extraneous-dependencies */
import {
  createLocalVue as clv,
  mount as m,
  shallowMount as sm,
  RouterLinkStub,
} from '@vue/test-utils';
import '@testing-library/jest-dom';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import deepmerge from 'deepmerge';
import '@/ui/plugins/vee-validate';

import Vue from 'vue';
import VueI18n from 'vue-i18n';
// import createTestStore from '@/store/store-test-config';

import formatCurrency from '@/ui/plugins/formatCurrency';
import { mockProvider } from '@/services/provider';

jest.setTimeout(10000);

const vuetify = new Vuetify({
  mocks: {
    $vuetify: {
      goTo: jest.fn(),
    },
  },
});

Vue.use(Vuetify);

// Create a localVue instance used for testing. A localVue prevents the global
// Vue namespace from being polluted, so tests are isolated.

// IMPORTANT: Update this function if we add more plugins to Vue.
export const createLocalVue = () => {
  const localVue = clv();
  localVue.use(Vuetify);
  localVue.use(Vuex);
  localVue.use(formatCurrency);

  return localVue;
};

const mocks = {
  $router: {
    replace: jest.fn(),
    push: jest.fn(),
    go: jest.fn(),
  },
  $route: { params: { id: 'id' } },
  $t: jest.fn((key) => key),
  $tc: jest.fn((key) => key),
  $m: jest.fn((m) => m?.value?.en),
  $toasted: {
    global: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
    show: jest.fn(),
  },
  $services: mockProvider(),
};

const stubs = {
  'router-link': RouterLinkStub,
  'router-view': true,
};

/**
 * Utility method that sets user permissions in the Vuex store. Accepts an array of string permission names
 * Usage: await wrapper.setPermissions(['EditCaseNote', 'PinCaseNote']);
 * @param {Array<string>} permissions
 */
async function setPermissions(permissions) {
  this.vm.$store.commit('user/setPermissions', { permissions: permissions.map((p) => ({ name: p })) });

  await this.vm.$nextTick();
}
/**
 * Utility method that remove user permissions in the Vuex store. Accepts an array of string permission names
 * Usage: await wrapper.removePermissions(['EditCaseNote', 'PinCaseNote']);
 * @param {Array<string>} permissions
 */
async function removePermissions(permissions) {
  this.vm.$store.commit('user/removePermissions', { permissions: permissions.map((p) => ({ name: p })) });

  await this.vm.$nextTick();
}

/**
 * Returns the results of wrapper.find with the param wrapped in the data-test query format
 * @param {String} dataTest The data test attribute to search for
 */
function findDataTest(dataTest) {
  return this.find(`[data-test="${dataTest}"]`);
}

export const mount = (Component, options) => {
  if (!options.localVue) {
    throw new Error('Must pass in localVue instance.');
  }

  document.body.setAttribute('data-app', true);

  const i18n = new VueI18n({
    locale: 'en',
  });

  // const store = createTestStore(options.store);

  const wrapper = m(Component, {
    vuetify,
    i18n,
    sync: false,
    ...options,
    // store,
    mocks: deepmerge(mocks, options.mocks || {}),
    stubs: deepmerge(stubs, options.stubs || {}),
  });

  wrapper.setPermissions = setPermissions;
  wrapper.removePermissions = removePermissions;
  wrapper.findDataTest = findDataTest;
  return wrapper;
};

export const shallowMount = (Component, options) => {
  if (!options.localVue) {
    throw new Error('Must pass in localVue instance.');
  }

  document.body.setAttribute('data-app', true);

  const i18n = new VueI18n({
    locale: 'en',
  });

  // const store = createTestStore(options.store);

  const wrapper = sm(Component, {
    vuetify,
    i18n,
    sync: false,
    ...options,
    // store,
    mocks: deepmerge(mocks, options.mocks || {}),
    stubs: deepmerge(stubs, options.stubs || {}),
  });

  wrapper.setPermissions = setPermissions;
  wrapper.removePermissions = removePermissions;
  wrapper.findDataTest = findDataTest;
  return wrapper;
};
