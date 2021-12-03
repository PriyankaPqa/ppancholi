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

import formatCurrency from '@/ui/plugins/formatCurrency';
import rolesAndPermissions from '@/ui/plugins/rolesAndPermissions';
import { mockProvider } from '@/services/provider';
import { mockStore } from '@/store';
import { makeStorage } from '@/store/storage';

jest.setTimeout(10000);

Vue.directive('visible', (el, binding) => {
  el.style.visibility = binding.value ? 'visible' : 'hidden';
});

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
  localVue.use(rolesAndPermissions);

  return localVue;
};

const mocks = {
  $router: {
    replace: jest.fn(),
    push: jest.fn(),
    go: jest.fn(),
    back: jest.fn(),
  },
  $route: {
    name: '',
    params: {},
    query: {},
  },
  $confirm: jest.fn(() => true),
  $message: jest.fn(() => true),
  $t: jest.fn((key) => key),
  $tc: jest.fn((key) => key),
  $m: jest.fn((m) => m?.translation?.en),
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
  $appInsights: {
    loadAppInsights: jest.fn(),
    trackPageView: jest.fn(),
    flush: jest.fn(),
    trackException: jest.fn(),
    trackTrace: jest.fn(),
  },
};

const stubs = {
  'router-link': RouterLinkStub,
  'router-view': true,
};

/**
 * Utility method that sets user permissions in the Vuex store. Accepts a string role
 * Usage: await wrapper.setRole('level6');
 * @param {string} role
 */
async function setRole(role) {
  this.vm.$store.commit('user/setRole', role);

  await this.vm.$nextTick();
}

/**
 * Returns the results of wrapper.find with the param wrapped in the data-test query format
 * @param {String} dataTest The data test attribute to search for
 */
function findDataTest(dataTest) {
  return this.find(`[data-test="${dataTest}"]`);
}

function findTextFieldWithValidation(dataTest) {
  return this.find(`[data-test="${dataTest}"]`).find('div');
}

function findSelectWithValidation(dataTest) {
  return this.find(`[data-test="${dataTest}"]`).find('.v-input');
}

export const mount = (Component, options) => {
  if (!options.localVue) {
    throw new Error('Must pass in localVue instance.');
  }

  document.body.setAttribute('data-app', true);

  const i18n = new VueI18n({
    locale: 'en',
  });

  const store = mockStore(options.store);
  const $storage = makeStorage(store);

  const wrapper = m(Component, {
    vuetify,
    i18n,
    sync: false,
    ...options,
    store,
    mocks: deepmerge({ ...mocks, $storage }, options.mocks || {}),
    stubs: deepmerge(stubs, options.stubs || {}),
  });

  wrapper.setRole = setRole;
  wrapper.findDataTest = findDataTest;
  wrapper.findTextFieldWithValidation = findTextFieldWithValidation;
  wrapper.findSelectWithValidation = findSelectWithValidation;
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

  const store = mockStore(options.store);
  const $storage = makeStorage(store);

  const wrapper = sm(Component, {
    vuetify,
    i18n,
    sync: false,
    ...options,
    store,
    mocks: deepmerge({ ...mocks, $storage }, options.mocks || {}),
    stubs: deepmerge(stubs, options.stubs || {}),
  });

  wrapper.setRole = setRole;
  wrapper.findDataTest = findDataTest;
  wrapper.findTextFieldWithValidation = findTextFieldWithValidation;
  wrapper.findSelectWithValidation = findSelectWithValidation;
  return wrapper;
};
