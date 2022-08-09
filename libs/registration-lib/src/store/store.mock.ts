import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import VueI18n from 'vue-i18n';

import { ERegistrationMode } from '@libs/shared-lib/types';
import { mockHttp } from '@libs/services-lib/http-client';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { mockProvider } from '../provider';
import { mockTabs } from './modules/registration/tabs.mock';
import { makeRegistrationModule } from './modules/registration';
import { HouseholdEntityModule } from './modules/household';
import { IState, IStore } from './store.types';
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
