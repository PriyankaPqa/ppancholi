import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import { makeRegistrationModule } from '@libs/registration-lib/store/modules/registration';
import { ERegistrationMode } from '@libs/registration-lib/types';
import { HouseholdEntityModule } from '@libs/registration-lib/store/modules/household';
import { HouseholdMetadataModule } from '@libs/registration-lib/store/modules/household/householdMetadata';
import { HouseholdsService } from '@libs/registration-lib/services/households/entity';
import { HouseholdMetadataService } from '@libs/registration-lib/services/households/metadata';
import { IRootState, IStore } from '@/store/store.types';
import { mockProvider } from '@/services/provider';

import * as vuexModule from '@/constants/vuex-modules';
import { httpClient } from '@/services/httpClient';
import { OptionItemsService } from '@/services/optionItems/optionItems';
import { tabs } from '@/store/modules/registration/tabs';
import { optionList } from '@/store/modules/optionList';
import { dashboard } from '@/store/modules/dashboard';
import { user } from '@/store/modules/user';

import { UserAccountEntityModule } from '@/store/modules/user-account/userAccountEntity';
import { UserAccountMetadataModule } from '@/store/modules/user-account/userAccountMetadata';
import { UserAccountsService } from '@/services/user-accounts/entity';
import { UserAccountsMetadataService } from '@/services/user-accounts/metadata';

import { CaseFileEntityModule } from '@/store/modules/case-file/caseFileEntity';
import { CaseFileMetadataModule } from '@/store/modules/case-file/caseFileMetadata';
import { CaseFilesService } from '@/services/case-files/entity';
import { CaseFilesMetadataService } from '@/services/case-files/metadata';

import { CaseNoteEntityModule } from '@/store/modules/case-note/caseNoteEntity';
import { CaseNoteMetadataModule } from '@/store/modules/case-note/caseNoteMetadata';
import { CaseNotesService } from '@/services/case-notes/entity';
import { CaseNotesMetadataService } from '@/services/case-notes/metadata';

import { EventEntityModule } from '@/store/modules/event/eventEntity';
import { EventMetadataModule } from '@/store/modules/event/eventMetadata';
import { EventsService } from '@/services/events/entity';
import { EventsMetadataService } from '@/services/events/metadata';

import { CaseFileReferralEntityModule } from '@/store/modules/case-file-referral/caseFileReferralEntity';
import { CaseFileReferralMetadataModule } from '@/store/modules/case-file-referral/caseFileReferralMetadata';
import { CaseFileReferralsService } from '@/services/case-file-referrals/entity';
import { CaseFileReferralsMetadataService } from '@/services/case-file-referrals/metadata';

import { CaseFileDocumentEntityModule } from '@/store/modules/case-file-document/caseFileDocumentEntity';
import { CaseFileDocumentMetadataModule } from '@/store/modules/case-file-document/caseFileDocumentMetadata';
import { CaseFileDocumentsService } from '@/services/case-file-documents/entity';
import { CaseFileDocumentsMetadataService } from '@/services/case-file-documents/metadata';

import { FinancialAssistanceEntityModule } from '@/store/modules/financial-assistance/financialAssistanceEntity';
import { FinancialAssistanceMetadataModule } from '@/store/modules/financial-assistance/financialAssistanceMetadata';
import { FinancialAssistanceTablesService } from '@/services/financial-assistance-tables/entity';
import { FinancialAssistanceTablesMetadataService } from '@/services/financial-assistance-tables/metadata';
import { MassActionEntityModule } from '@/store/modules/mass-action/massActionEntity';
import { MassActionService } from '@/services/mass-actions/entity';
import { MassActionMetadataModule } from '@/store/modules/mass-action/massActionMetadata';

import { TeamEntityModule } from '@/store/modules/team/teamEntity';
import { TeamMetadataModule } from '@/store/modules/team/teamMetadata';
import { TeamsService } from '@/services/teams/entity';
import { TeamsMetadataService } from '@/services/teams/metadata';

import { ProgramEntityModule } from '@/store/modules/program/programEntity';
import { ProgramMetadataModule } from '@/store/modules/program/programMetadata';
import { ProgramsService } from '@/services/programs/entity';
import { ProgramsMetadataService } from '@/services/programs/metadata';

import { FinancialAssistanceCategoryEntityModule } from '@/store/modules/financial-assistance-category/financialAssistanceCategoryEntity';
import { FinancialAssistanceCategoriesService } from '@/services/financial-assistance-categories/entity';
import { FinancialAssistancePaymentsService } from '@/services/financial-assistance-payments/entity';
import { FinancialAssistancePaymentsMetadataService } from '@/services/financial-assistance-payments/metadata';
import { TenantSettingsService } from '@/services/tenantSettings/entity';
import { FinancialAssistancePaymentEntityModule } from './modules/financial-assistance-payments/financialAssistancePaymentEntity';
import { FinancialAssistancePaymentMetadataModule } from './modules/financial-assistance-payments/financialAssistancePaymentMetadata';
import { TenantSettingsEntityModule } from './modules/tenantSettings/tenantSettingsEntity';
import { UIStateModule } from './modules/ui-state/uiState';

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
    [vuexModule.CASE_DOCUMENT_ENTITIES]:
      new CaseFileDocumentEntityModule(new CaseFileDocumentsService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.CASE_DOCUMENT_METADATA]:
      new CaseFileDocumentMetadataModule(new CaseFileDocumentsMetadataService(httpClient)).getModule(),
    [vuexModule.EVENT_ENTITIES]: new EventEntityModule(new EventsService(httpClient), new OptionItemsService(httpClient)).getModule(),
    [vuexModule.EVENT_METADATA]: new EventMetadataModule(new EventsMetadataService(httpClient)).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_ENTITIES]: new FinancialAssistanceEntityModule(new FinancialAssistanceTablesService(httpClient)).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_METADATA]: new FinancialAssistanceMetadataModule(
      new FinancialAssistanceTablesMetadataService(httpClient),
    ).getModule(),
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
    [vuexModule.USER_ACCOUNT_ENTITIES]: new UserAccountEntityModule(new UserAccountsService(httpClient),
      new OptionItemsService(httpClient)).getModule(),
    [vuexModule.USER_ACCOUNT_METADATA]: new UserAccountMetadataModule(new UserAccountsMetadataService(httpClient)).getModule(),

    [vuexModule.USER_MODULE]: user,
    [vuexModule.DASHBOARD_MODULE]: dashboard,
    [vuexModule.OPTION_LIST_MODULE]: optionList,
    [vuexModule.TEAM_ENTITIES]: new TeamEntityModule(new TeamsService(httpClient)).getModule(),
    [vuexModule.TEAM_METADATA]: new TeamMetadataModule(new TeamsMetadataService(httpClient)).getModule(),
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: true, skipEmailPhoneRules: true, mode: ERegistrationMode.CRC,
    }),
    [vuexModule.MASS_ACTION_ENTITIES]: new MassActionEntityModule(new MassActionService(httpClient)).getModule(),
    [vuexModule.MASS_ACTION_METADATA]: new MassActionMetadataModule(null).getModule(),

    [vuexModule.PROGRAM_ENTITIES]: new ProgramEntityModule(new ProgramsService(httpClient)).getModule(),
    [vuexModule.PROGRAM_METADATA]: new ProgramMetadataModule(new ProgramsMetadataService(httpClient)).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES]: new FinancialAssistanceCategoryEntityModule(
      new FinancialAssistanceCategoriesService(httpClient),
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES]:
      new FinancialAssistancePaymentEntityModule(new FinancialAssistancePaymentsService(httpClient)).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA]:
      new FinancialAssistancePaymentMetadataModule(new FinancialAssistancePaymentsMetadataService(httpClient)).getModule(),

    [vuexModule.TENANT_SETTINGS_ENTITIES]:
      new TenantSettingsEntityModule(new TenantSettingsService(httpClient)).getModule(),

    [vuexModule.UI_STATE]:
      new UIStateModule().getModule(),
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
