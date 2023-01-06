import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import { makeRegistrationModule } from '@libs/registration-lib/store/modules/registration';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { HouseholdEntityModule } from '@libs/registration-lib/store/modules/household';
import { HouseholdMetadataModule } from '@libs/registration-lib/store/modules/household/householdMetadata';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';
import { IRootState, IStore } from '@/store/store.types';
import * as vuexModule from '@/constants/vuex-modules';
import { httpClient } from '@/services/httpClient';
import { OptionItemsService } from '@libs/services-lib/optionItems/optionItems';
import { tabs } from '@/store/modules/registration/tabs';
import { optionList } from '@/store/modules/optionList';

import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { ApprovalTablesMetadataService } from '@libs/services-lib/approval-tables/metadata/approvalTables';
import { ApprovalTableEntityModule } from '@/store/modules/approval-table/approvalTableEntity';
import { ApprovalTableMetadataModule } from '@/store/modules/approval-table/approvalTableMetadata';

import { UserAccountEntityModule } from '@/store/modules/user-account/userAccountEntity';
import { UserAccountMetadataModule } from '@/store/modules/user-account/userAccountMetadata';
import { UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { UserAccountsMetadataService } from '@libs/services-lib/user-accounts/metadata';

import { CaseFileEntityModule } from '@/store/modules/case-file/caseFileEntity';
import { CaseFileMetadataModule } from '@/store/modules/case-file/caseFileMetadata';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { CaseFilesMetadataService } from '@libs/services-lib/case-files/metadata';

import { CaseNoteEntityModule } from '@/store/modules/case-note/caseNoteEntity';
import { CaseNoteMetadataModule } from '@/store/modules/case-note/caseNoteMetadata';
import { CaseNotesService } from '@libs/services-lib/case-notes/entity';
import { CaseNotesMetadataService } from '@libs/services-lib/case-notes/metadata';

import { CaseFileReferralEntityModule } from '@/store/modules/case-file-referral/caseFileReferralEntity';
import { CaseFileReferralMetadataModule } from '@/store/modules/case-file-referral/caseFileReferralMetadata';
import { CaseFileReferralsService } from '@libs/services-lib/case-file-referrals/entity';
import { CaseFileReferralsMetadataService } from '@libs/services-lib/case-file-referrals/metadata';

import { CaseFileDocumentEntityModule } from '@/store/modules/case-file-document/caseFileDocumentEntity';
import { CaseFileDocumentMetadataModule } from '@/store/modules/case-file-document/caseFileDocumentMetadata';
import { CaseFileDocumentsService } from '@libs/services-lib/case-file-documents/entity';
import { CaseFileDocumentsMetadataService } from '@libs/services-lib/case-file-documents/metadata';

import { FinancialAssistanceEntityModule } from '@/store/modules/financial-assistance/financialAssistanceEntity';
import { FinancialAssistanceMetadataModule } from '@/store/modules/financial-assistance/financialAssistanceMetadata';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { FinancialAssistanceTablesMetadataService } from '@libs/services-lib/financial-assistance-tables/metadata';
import { MassActionEntityModule } from '@/store/modules/mass-action/massActionEntity';
import { MassActionService } from '@libs/services-lib/mass-actions/entity';
import { MassActionMetadataModule } from '@/store/modules/mass-action/massActionMetadata';

import { TeamEntityModule } from '@/store/modules/team/teamEntity';
import { TeamMetadataModule } from '@/store/modules/team/teamMetadata';
import { TeamsService } from '@libs/services-lib/teams/entity';
import { TeamsMetadataService } from '@libs/services-lib/teams/metadata';

import { FinancialAssistanceCategoryEntityModule } from '@/store/modules/financial-assistance-category/financialAssistanceCategoryEntity';
import { FinancialAssistanceCategoriesService } from '@libs/services-lib/financial-assistance-categories/entity';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import { FinancialAssistancePaymentsMetadataService } from '@libs/services-lib/financial-assistance-payments/metadata';
import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { mockSignalR } from '@/ui/plugins/signal-r';
import { mockProvider } from '@/services/provider';
import { FinancialAssistancePaymentEntityModule } from './modules/financial-assistance-payments/financialAssistancePaymentEntity';
import { FinancialAssistancePaymentMetadataModule } from './modules/financial-assistance-payments/financialAssistancePaymentMetadata';
import { TenantSettingsEntityModule } from './modules/tenantSettings/tenantSettingsEntity';

const i18n = {
  t: jest.fn(),
} as unknown as VueI18n;

Vue.use(Vuex);

const mockConfig = {
  modules: {
    [vuexModule.CASE_FILE_ENTITIES]: new CaseFileEntityModule(
      new CaseFilesService(httpClient),
      new OptionItemsService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.CASE_FILE_METADATA]: new CaseFileMetadataModule(
      new CaseFilesMetadataService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.CASE_NOTE_ENTITIES]: new CaseNoteEntityModule(
      new CaseNotesService(httpClient),
      new OptionItemsService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.CASE_NOTE_METADATA]: new CaseNoteMetadataModule(
      new CaseNotesMetadataService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.CASE_REFERRAL_ENTITIES]:
      new CaseFileReferralEntityModule(
        new CaseFileReferralsService(httpClient),
        new OptionItemsService(httpClient),
        mockSignalR(),
      ).getModule(),
    [vuexModule.CASE_REFERRAL_METADATA]:
      new CaseFileReferralMetadataModule(
        new CaseFileReferralsMetadataService(httpClient),
        mockSignalR(),
      ).getModule(),
    [vuexModule.CASE_DOCUMENT_ENTITIES]:
      new CaseFileDocumentEntityModule(
        new CaseFileDocumentsService(httpClient),
        new OptionItemsService(httpClient),
        mockSignalR(),
      ).getModule(),
    [vuexModule.CASE_DOCUMENT_METADATA]:
      new CaseFileDocumentMetadataModule(
        new CaseFileDocumentsMetadataService(httpClient),
        mockSignalR(),
      ).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_ENTITIES]: new FinancialAssistanceEntityModule(
      new FinancialAssistanceTablesService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_METADATA]: new FinancialAssistanceMetadataModule(
      new FinancialAssistanceTablesMetadataService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
    [vuexModule.USER_ACCOUNT_ENTITIES]: new UserAccountEntityModule(
      new UserAccountsService(httpClient),
      new OptionItemsService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.USER_ACCOUNT_METADATA]: new UserAccountMetadataModule(
      new UserAccountsMetadataService(httpClient),
      mockSignalR(),
    ).getModule(),

    [vuexModule.OPTION_LIST_MODULE]: optionList,
    [vuexModule.TEAM_ENTITIES]: new TeamEntityModule(
      new TeamsService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.TEAM_METADATA]: new TeamMetadataModule(
      new TeamsMetadataService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: true, skipEmailPhoneRules: true, mode: ERegistrationMode.CRC,
    }),
    [vuexModule.MASS_ACTION_ENTITIES]: new MassActionEntityModule(
      new MassActionService(httpClient),
      mockSignalR(),
    ).getModule(),
    [vuexModule.MASS_ACTION_METADATA]: new MassActionMetadataModule(null, mockSignalR()).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES]: new FinancialAssistanceCategoryEntityModule(
      new FinancialAssistanceCategoriesService(httpClient),
      mockSignalR(),
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES]:
      new FinancialAssistancePaymentEntityModule(
        new FinancialAssistancePaymentsService(httpClient),
        mockSignalR(),
      ).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA]:
      new FinancialAssistancePaymentMetadataModule(
        new FinancialAssistancePaymentsMetadataService(httpClient),
        mockSignalR(),
      ).getModule(),

    [vuexModule.TENANT_SETTINGS_ENTITIES]:
      new TenantSettingsEntityModule(
        new TenantSettingsService(httpClient),
        mockSignalR(),
      ).getModule(),

    [vuexModule.APPROVALS_TABLE_ENTITIES]: new ApprovalTableEntityModule(
      new ApprovalTablesService(httpClient),
      mockSignalR(),
    ).getModule(),

    [vuexModule.APPROVALS_TABLE_METADATA]: new ApprovalTableMetadataModule(
      new ApprovalTablesMetadataService(httpClient),
      mockSignalR(),
    ).getModule(),
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
