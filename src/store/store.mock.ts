import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import VueI18n from 'vue-i18n';

import { ERegistrationMode } from '../types/enums/ERegistrationMode';
import { mockProvider } from '../services/provider';
import { mockTabs } from './modules/registration/tabs.mock';
import { makeRegistrationModule } from './modules/registration';
import { makeBeneficiaryModule } from './modules/beneficiary';
import { IState, IStore } from './store.types';

const i18n = {
  t: jest.fn((p: string) => p),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    registration: makeRegistrationModule({
      i18n, tabs: mockTabs(), skipAgeRestriction: false, skipEmailPhoneRules: false, mode: ERegistrationMode.Self,
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

  const store = new Vuex.Store(mergedConfig) as IStore<IState>;

  if (mocks.dispatch) {
    store.dispatch = jest.fn();
  }
  if (mocks.commit) {
    store.commit = jest.fn();
  }

  store.$services = mockProvider();
  return store;
};
