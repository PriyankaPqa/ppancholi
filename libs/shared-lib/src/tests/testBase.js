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
  mockStore, mockProviderInstance, makeStorage, mountMethod, mockStorage,
}) => {
  if (!options.localVue) {
    throw new Error('Must pass in localVue instance.');
  }

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
    $t: jest.fn((key) => key),
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
    $services: mockProviderInstance,
    $appInsights: {
      loadAppInsights: jest.fn(),
      trackPageView: jest.fn(),
      flush: jest.fn(),
      trackException: jest.fn(),
      trackTrace: jest.fn(),
      setBasicContext: jest.fn(),
    },
    $signalR: { connection: { on: jest.fn(), off: jest.fn() }, unsubscribeAll: jest.fn() },
  };

  document.body.setAttribute('data-app', true);

  const i18n = new VueI18n({
    locale: 'en',
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

  const store = mockStore(options.store);
  let $storage;
  if (mockStorage) {
    $storage = mockStorage;
  } else {
    $storage = makeStorage(store);
  }

  const wrapper = mountMethod(Component, {
    vuetify,
    i18n,
    sync: false,
    ...options,
    store,
    mocks: deepmerge({ ...mocks, $storage }, options.mocks || {}),
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
  return localVue;
};
