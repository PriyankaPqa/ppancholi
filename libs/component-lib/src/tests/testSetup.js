/* eslint-disable no-undef */
import {
  createLocalVue as clv,
  mount as m,
  shallowMount as sm,
} from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import deepmerge from 'deepmerge';

const vuetify = new Vuetify();

Vue.use(Vuetify);

// Create a localVue instance used for testing. A localVue prevents the global
// Vue namespace from being polluted, so tests are isolated.
export const createLocalVue = () => {
  const localVue = clv();
  localVue.use(Vuetify);

  return localVue;
};

const mocks = {
  $t: jest.fn((key) => key),
  $tc: jest.fn((key) => key),
};

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

  const wrapper = m(Component, {
    vuetify,
    sync: false,
    ...options,
    mocks: deepmerge(mocks, options.mocks || {}),
  });

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

  const wrapper = sm(Component, {
    vuetify,
    sync: false,
    ...options,
    mocks: deepmerge(mocks, options.mocks || {}),
  });

  wrapper.findDataTest = findDataTest;
  wrapper.findTextFieldWithValidation = findTextFieldWithValidation;
  wrapper.findSelectWithValidation = findSelectWithValidation;
  return wrapper;
};
