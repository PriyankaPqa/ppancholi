import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import VueI18n from 'vue-i18n';

import { mockHttp } from '@libs/core-lib/src/services/http-client';
import { ERegistrationMode } from '@libs/core-lib/types';
import { TenantSettingsService } from '../services/tenantSettings/entity';
import { mockProvider } from '../services/provider';
import { mockTabs } from './modules/registration/tabs.mock';
import { makeRegistrationModule } from './modules/registration';
import { HouseholdEntityModule } from './modules/household';
import { IState, IStore } from './store.types';
import { HouseholdsService } from '../services/households/entity';
import { TenantSettingsEntityModule } from './modules/tenantSettings/tenantSettingsEntity';

const i18n = {
  t: jest.fn((p: string) => p),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    registration: makeRegistrationModule({
      i18n, tabs: mockTabs(), skipAgeRestriction: false, skipEmailPhoneRules: false, mode: ERegistrationMode.Self,
    }),
    household: new HouseholdEntityModule(new HouseholdsService(mockHttp())).getModule(),
    tenantSettings: new TenantSettingsEntityModule(new TenantSettingsService(mockHttp()), null).getModule(),
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
