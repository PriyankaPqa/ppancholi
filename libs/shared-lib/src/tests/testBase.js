/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocalVue as clv, RouterLinkStub } from '@vue/test-utils';
import VueI18n from 'vue-i18n';
import deepmerge from 'deepmerge';
import Vuetify from 'vuetify';
import Vue from 'vue';

Vue.use(Vuetify);

Vue.directive('visible', (el, binding) => {
  el.style.visibility = binding.value ? 'visible' : 'hidden';
});

Vue.toasted = {
  global: {
    warning: jest.fn(),
    error: jest.fn(),
  },
};

Vue.prototype.$reportToasted = jest.fn();

function findDataTest(dataTest) {
  return this.find(`[data-test="${dataTest}"]`);
}

function findTextFieldWithValidation(dataTest) {
  return this.find(`[data-test="${dataTest}"]`).find('div');
}

function findSelectWithValidation(dataTest) {
  return this.find(`[data-test="${dataTest}"]`).find('.v-input');
}

export const getWrapper = (Component, options, {
  mockStore, mountMethod,
}) => {
  if (!options.localVue) {
    throw new Error('Must pass in localVue instance.');
  }

  options.featureList = options.featureList || [];

  const mocks = {
    $router: {
      replace: jest.fn(),
      push: jest.fn(),
      go: jest.fn(),
      back: jest.fn(),
      resolve: jest.fn(() => ({ href: 'new url' })),
    },
    $route: {
      name: '',
      params: {},
      query: {},
    },
    $t: jest.fn((key, ...params) => (params?.length ? { key, params } : key)),
    $tc: jest.fn((key) => key),
    $m: jest.fn((m) => m?.translation?.en),
    $confirm: jest.fn(() => true),
    $message: jest.fn(() => true),
    $toasted: {
      global: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn(),
        errorReport: jest.fn(() => ({
          el: {
            appendChild: jest.fn(),
            querySelector: jest.fn(() => ({
              appendChild: jest.fn(),
            })),
          },
          goAway: jest.fn(),
        })),
      },
      show: jest.fn(),
    },
    $appInsights: {
      loadAppInsights: jest.fn(),
      trackPageView: jest.fn(),
      flush: jest.fn(),
      trackException: jest.fn(),
      trackTrace: jest.fn(),
      setBasicContext: jest.fn(),
    },
    $signalR: { connection: { on: jest.fn(), off: jest.fn() }, unsubscribeAll: jest.fn() },
    $hasFeature: jest.fn((f) => options.featureList.indexOf(f) > -1),
  };

  document.body.setAttribute('data-app', true);

  const i18n = new VueI18n({
    locale: 'en',
    silentTranslationWarn: true,
  });

  const vuetify = new Vuetify({
    mocks: {
      $vuetify: {
        goTo: jest.fn(),
      },
    },
  });

  const stubs = {
    'router-link': RouterLinkStub,
    'router-view': true,
  };

  let store;
  if (mockStore) {
    store = mockStore(options.store);
  }

  const wrapper = mountMethod(Component, {
    vuetify,
    i18n,
    sync: false,
    ...options,
    store,
    mocks: deepmerge({ ...mocks }, options.mocks || {}),
    stubs: deepmerge(stubs, options.stubs || {}),
  });

  wrapper.findDataTest = findDataTest;
  wrapper.findTextFieldWithValidation = findTextFieldWithValidation;
  wrapper.findSelectWithValidation = findSelectWithValidation;
  return wrapper;
};

export const getLocalVue = (plugins) => {
  const localVue = clv();
  plugins.forEach((p) => localVue.use(p));

  // in test mode we don't need the props checks
  // we sometimes have data that doesnt follow the correct typings for test purposes
  const outputErrorToConsole = console.error;
  console.error = (...data) => {
    if (data.length === 1 && typeof data[0] === 'string' && data[0].startsWith('[Vue warn]: Invalid prop: type check failed')
      // kinda specific to $t mocked
      && data[0].indexOf('Expected String, got Object') > -1) {
      return;
    }
    outputErrorToConsole(...data);
  };
  return localVue;
};
