import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import { mockProvider } from '@/services/provider';

import { HouseholdEntityModule } from '@crctech/registration-lib/src/store/modules/household';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { HouseholdMetadataModule } from '@crctech/registration-lib/src/store/modules/household/householdMetadata';
import { HouseholdMetadataService } from '@crctech/registration-lib/src/services/households/metadata/index';
import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration/';
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
import { CaseFilesService } from '@/services/case-files/entity';
import { OptionItemsService } from '@/services/optionItems';
import { CaseFilesMetadataService } from '@/services/case-files/metadata';
import { CaseNotesService } from '@/services/case-notes/entity';
import { CaseNotesMetadataService } from '@/services/case-notes/metadata';
import { CaseFileReferralsService } from '@/services/case-file-referrals/entity';
import { CaseFileReferralsMetadataService } from '@/services/case-file-referrals/metadata';
import { user } from './modules/user';
import { dashboard } from './modules/dashboard';
import { event } from './modules/event';
import { team } from './modules/team';
import { optionList } from './modules/optionList';
import { program } from './modules/program';
import { CaseFileEntityModule } from './modules/case-file/caseFileEntity';
import { CaseFileMetadataModule } from './modules/case-file/caseFileMetadata';
import { CaseNoteEntityModule } from './modules/case-note/caseNoteEntity';
import { CaseNoteMetadataModule } from './modules/case-note/caseNoteMetadata';
import { CaseFileReferralEntityModule } from './modules/case-file-referral/caseFileReferralEntity';
import { CaseFileReferralMetadataModule } from './modules/case-file-referral/caseFileReferralMetadata';
import { financialAssistance } from './modules/financial-assistance';

const i18n = {
  t: jest.fn(),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    [vuexModule.CASE_FILE_ENTITIES]: new CaseFileEntityModule(new CaseFilesService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.CASE_FILE_METADATA]: new CaseFileMetadataModule(new CaseFilesMetadataService(httpClient)).getModule(),
    [vuexModule.CASE_NOTE_ENTITIES]: new CaseNoteEntityModule(new CaseNotesService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.CASE_NOTE_METADATA]: new CaseNoteMetadataModule(new CaseNotesMetadataService(httpClient)).getModule(),
    [vuexModule.CASE_REFERRAL_ENTITIES]:
      new CaseFileReferralEntityModule(new CaseFileReferralsService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.CASE_REFERRAL_METADATA]:
      new CaseFileReferralMetadataModule(new CaseFileReferralsMetadataService(httpClient)).getModule(),
    [vuexModule.USER_MODULE]: user,
    [vuexModule.DASHBOARD_MODULE]: dashboard,
    [vuexModule.EVENT_MODULE]: event,
    [vuexModule.OPTION_LIST_MODULE]: optionList,
    [vuexModule.TEAM_MODULE]: team,
    [vuexModule.PROGRAM_MODULE]: program,
    [vuexModule.FINANCIAL_ASSISTANCE_MODULE]: financialAssistance,
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
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
