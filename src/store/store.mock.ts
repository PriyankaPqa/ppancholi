import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import { mockProvider } from '@/services/provider';

import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration/';
import { makeBeneficiaryModule } from '@crctech/registration-lib/src/store/modules/beneficiary/';
import { ERegistrationMode } from '@crctech/registration-lib/src/types';

import { tabs } from '@/store/modules/registration/tabs';

import VueI18n from 'vue-i18n';
import { IRootState, IStore } from '@/store/store.types';
import { userAccount } from './modules/user-account/user-account';
import { user } from './modules/user';
import { caseFile } from './modules/case-file';
import { dashboard } from './modules/dashboard';
import { event } from './modules/event';
import { team } from './modules/team';
import { optionList } from './modules/optionList';
import { appUser } from './modules/app-user';
import { program } from './modules/program';

const i18n = {
  t: jest.fn(),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    user,
    userAccount,
    caseFile,
    dashboard,
    event,
    team,
    optionList,
    appUser,
    program,
    registration: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: true, skipEmailPhoneRules: true, mode: ERegistrationMode.CRC,
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
