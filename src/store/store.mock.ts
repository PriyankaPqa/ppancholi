import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import { mockProvider } from '@/services/provider';

import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration';
import { makeHouseholdModule } from '@crctech/registration-lib/src/store/modules/household';
import { ERegistrationMode } from '@crctech/registration-lib/src/types';

import { tabs } from '@/store/modules/registration/tabs';

import VueI18n from 'vue-i18n';
import { IRootState, IStore } from '@/store/store.types';
import * as vuexModule from '@/constants/vuex-modules';
import { UserAccountEntityModule } from '@/store/modules/user-account/userAccountEntity';
import { UserAccountsService } from '@/services/user-accounts/entity';
import { httpClient } from '@/services/httpClient';
import { UserAccountMetadataModule } from '@/store/modules/user-account/userAccountMetadata';
import { UserAccountsMetadataService } from '@/services/user-accounts/metadata';
import { user } from './modules/user';
import { caseFile } from './modules/case-file';
import { dashboard } from './modules/dashboard';
import { event } from './modules/event';
import { team } from './modules/team';
import { optionList } from './modules/optionList';
import { program } from './modules/program';

const i18n = {
  t: jest.fn(),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    [vuexModule.CASE_FILE_MODULE]: caseFile,
    [vuexModule.USER_MODULE]: user,
    [vuexModule.DASHBOARD_MODULE]: dashboard,
    [vuexModule.EVENT_MODULE]: event,
    [vuexModule.OPTION_LIST_MODULE]: optionList,
    [vuexModule.TEAM_MODULE]: team,
    [vuexModule.PROGRAM_MODULE]: program,
    [vuexModule.HOUSEHOLD_MODULE]: makeHouseholdModule(),
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: true, skipEmailPhoneRules: true, mode: ERegistrationMode.CRC,
    }),
    [vuexModule.USER_ACCOUNT_ENTITIES]: new UserAccountEntityModule(new UserAccountsService(httpClient)).getModule(),
    [vuexModule.USER_ACCOUNT_METADATA]: new UserAccountMetadataModule(new UserAccountsMetadataService(httpClient)).getModule(),
  },
};

export const mockStore = (overrides = {}, mocks = { dispatch: false, commit: false }) => {
  const baseConfig = _cloneDeep(mockConfig);
  const overs = _cloneDeep(overrides);

  const mergedConfig = deepmerge(baseConfig, overs, {
    arrayMerge: (dest, source) => source,
  });

  const store = new Vuex.Store(mergedConfig) as IStore<IRootState>;

  if (mocks.dispatch) {
    store.dispatch = jest.fn();
  }
  if (mocks.commit) {
    store.commit = jest.fn();
  }

  store.$services = mockProvider();
  return store;
};
