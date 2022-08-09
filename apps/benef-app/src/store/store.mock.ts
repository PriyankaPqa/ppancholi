import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import VueI18n from 'vue-i18n';

import { makeRegistrationModule } from '@libs/registration-lib/store/modules/registration/';
import { HouseholdEntityModule } from '@libs/registration-lib/store/modules/household';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { HouseholdMetadataModule } from '@libs/registration-lib/store/modules/household/householdMetadata';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';
import { TenantSettingsEntityModule } from '@libs/registration-lib/store/modules/tenantSettings/tenantSettingsEntity';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import * as vuexModule from '@/constants/vuex-modules';
import { tabs } from '@/store/modules/registration/tabs';
import { mockProvider } from '@/services/provider';
import vuetify from '@libs/shared-lib/plugins/vuetify/vuetify';
import { httpClient } from '@/services/httpClient';

const i18n = {
  t: jest.fn(),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: false, skipEmailPhoneRules: false, mode: ERegistrationMode.Self,
    }),
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
    [vuexModule.TENANT_SETTINGS_ENTITIES]:
    new TenantSettingsEntityModule(new TenantSettingsService(httpClient), vuetify).getModule(),
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
