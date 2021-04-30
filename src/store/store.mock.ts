import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import VueI18n from 'vue-i18n';

import { mockProvider } from '@/services/provider';

import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration/';
import { makeBeneficiaryModule } from '@crctech/registration-lib/src/store/modules/beneficiary/';

import { tabs } from '@/store/modules/registration/tabs';

const i18n = {
  t: jest.fn(),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    registration: makeRegistrationModule({
      i18n, tabs, skipAgeRestriction: false, skipEmailPhoneRules: false,
    }),
    beneficiary: makeBeneficiaryModule(),
  },
};

export const mockStore = (overrides = {}, mocks = { dispatch: false, commit: false }) => {
  const baseConfig = _cloneDeep(mockConfig);
  const overs = _cloneDeep(overrides);

  const mergedConfig = deepmerge(baseConfig, overs, {
    arrayMerge: (dest, source) => source,
  });

  const store = new Vuex.Store(mergedConfig);

  if (mocks.dispatch) {
    store.dispatch = jest.fn();
  }
  if (mocks.commit) {
    store.commit = jest.fn();
  }

  store.$services = mockProvider();
  return store;
};
