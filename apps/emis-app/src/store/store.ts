import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { makeRegistrationModule } from '@libs/registration-lib/store/modules/registration';
import { ERegistrationMode } from '@libs/shared-lib/types';
import { HouseholdEntityModule } from '@libs/registration-lib/store/modules/household';
import { HouseholdMetadataModule } from '@libs/registration-lib/store/modules/household/householdMetadata';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';
import { i18n } from '@/ui/plugins';
import * as vuexModule from '@/constants/vuex-modules';
import { httpClient } from '@/services/httpClient';
import { OptionItemsService } from '@libs/services-lib/optionItems/optionItems';
import { tabs } from '@/store/modules/registration/tabs';
import { optionList } from '@/store/modules/optionList';

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

import { CaseFileDocumentEntityModule } from '@/store/modules/case-file-document/caseFileDocumentEntity';
import { CaseFileDocumentMetadataModule } from '@/store/modules/case-file-document/caseFileDocumentMetadata';
import { CaseFileDocumentsService } from '@libs/services-lib/case-file-documents/entity';
import { CaseFileDocumentsMetadataService } from '@libs/services-lib/case-file-documents/metadata';

import { FinancialAssistanceEntityModule } from '@/store/modules/financial-assistance/financialAssistanceEntity';
import { FinancialAssistanceMetadataModule } from '@/store/modules/financial-assistance/financialAssistanceMetadata';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { FinancialAssistanceTablesMetadataService } from '@libs/services-lib/financial-assistance-tables/metadata';

import { TeamEntityModule } from '@/store/modules/team/teamEntity';
import { TeamMetadataModule } from '@/store/modules/team/teamMetadata';
import { TeamsService } from '@libs/services-lib/teams/entity';
import { TeamsMetadataService } from '@libs/services-lib/teams/metadata';

import { MassActionEntityModule } from '@/store/modules/mass-action/massActionEntity';
import { MassActionService } from '@libs/services-lib/mass-actions/entity';
import { MassActionMetadataModule } from '@/store/modules/mass-action/massActionMetadata';
import { MassActionMetadataService } from '@libs/services-lib/mass-actions/metadata';

import { FinancialAssistanceCategoryEntityModule } from '@/store/modules/financial-assistance-category/financialAssistanceCategoryEntity';
import { FinancialAssistanceCategoriesService } from '@libs/services-lib/financial-assistance-categories/entity';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import { FinancialAssistancePaymentsMetadataService } from '@libs/services-lib/financial-assistance-payments/metadata';

import { TenantSettingsService } from '@libs/services-lib/tenantSettings/entity';
import { SignalR } from '@/ui/plugins/signal-r';

import { AssessmentTemplatesService } from '@libs/services-lib/assessment-template/entity';
import { AssessmentTemplatesMetadataService } from '@libs/services-lib/assessment-template/metadata';
import { AssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { AssessmentResponsesMetadataService } from '@libs/services-lib/assessment-response/metadata';

import { ApprovalTableEntityModule } from '@/store/modules/approval-table/approvalTableEntity';
import { ApprovalTablesService } from '@libs/services-lib/approval-tables/entity';
import { ApprovalTableMetadataModule } from '@/store/modules/approval-table/approvalTableMetadata';
import { ApprovalTablesMetadataService } from '@libs/services-lib/approval-tables/metadata/approvalTables';
import { AssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { AssessmentFormsMetadataService } from '@libs/services-lib/assessment-form/metadata';
import { FinancialAssistancePaymentEntityModule } from './modules/financial-assistance-payments/financialAssistancePaymentEntity';
import { FinancialAssistancePaymentMetadataModule } from './modules/financial-assistance-payments/financialAssistancePaymentMetadata';
import { TenantSettingsEntityModule } from './modules/tenantSettings/tenantSettingsEntity';

import { AssessmentTemplateEntityModule } from './modules/assessment-template/assessmentTemplateEntity';
import { AssessmentTemplateMetadataModule } from './modules/assessment-template/assessmentTemplateMetadata';
import { AssessmentFormEntityModule } from './modules/assessment-form/assessmentFormEntity';
import { AssessmentFormMetadataModule } from './modules/assessment-form/assessmentFormMetadata';
import { AssessmentResponseEntityModule } from './modules/assessment-response/assessmentResponseEntity';
import { AssessmentResponseMetadataModule } from './modules/assessment-response/assessmentResponseMetadata';

import { IRootState } from './store.types';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.VITE_APP_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    [vuexModule.CASE_FILE_ENTITIES]: new CaseFileEntityModule(
      new CaseFilesService(httpClient),
      new OptionItemsService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.CASE_FILE_METADATA]: new CaseFileMetadataModule(
      new CaseFilesMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.CASE_NOTE_ENTITIES]: new CaseNoteEntityModule(
      new CaseNotesService(httpClient),
      new OptionItemsService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.CASE_NOTE_METADATA]: new CaseNoteMetadataModule(
      new CaseNotesMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.CASE_DOCUMENT_ENTITIES]: new CaseFileDocumentEntityModule(
      new CaseFileDocumentsService(httpClient),
      new OptionItemsService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.CASE_DOCUMENT_METADATA]: new CaseFileDocumentMetadataModule(
      new CaseFileDocumentsMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_ENTITIES]: new FinancialAssistanceEntityModule(
      new FinancialAssistanceTablesService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_METADATA]: new FinancialAssistanceMetadataModule(
      new FinancialAssistanceTablesMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(
      new HouseholdsService(httpClient),
    ).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(
      new HouseholdMetadataService(httpClient),
    ).getModule(),

    // User Accounts: do not include SignalR to skip subscribing to changes in this data.
    // The number of entities is too large in the prod CRC tenant, so this cannot be used
    // unless calls to getAll are removed.
    [vuexModule.USER_ACCOUNT_ENTITIES]: new UserAccountEntityModule(
      new UserAccountsService(httpClient),
      new OptionItemsService(httpClient),
      null, // SignalR,
    ).getModule(),
    [vuexModule.USER_ACCOUNT_METADATA]: new UserAccountMetadataModule(
      new UserAccountsMetadataService(httpClient),
      null, // SignalR,
    ).getModule(),

    [vuexModule.OPTION_LIST_MODULE]: optionList,
    [vuexModule.TEAM_ENTITIES]: new TeamEntityModule(
      new TeamsService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.TEAM_METADATA]: new TeamMetadataModule(
      new TeamsMetadataService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n,
      tabs: tabs(),
      skipAgeRestriction: true,
      skipEmailPhoneRules: true,
      mode: ERegistrationMode.CRC,
    }),

    [vuexModule.MASS_ACTION_ENTITIES]: new MassActionEntityModule(
      new MassActionService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.MASS_ACTION_METADATA]: new MassActionMetadataModule(
      new MassActionMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES]: new FinancialAssistanceCategoryEntityModule(
      new FinancialAssistanceCategoriesService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES]: new FinancialAssistancePaymentEntityModule(
      new FinancialAssistancePaymentsService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA]: new FinancialAssistancePaymentMetadataModule(
      new FinancialAssistancePaymentsMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.TENANT_SETTINGS_ENTITIES]: new TenantSettingsEntityModule(
      new TenantSettingsService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.ASSESSMENT_TEMPLATE_ENTITIES]: new AssessmentTemplateEntityModule(
      new AssessmentTemplatesService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.ASSESSMENT_TEMPLATE_METADATA]: new AssessmentTemplateMetadataModule(
      new AssessmentTemplatesMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.APPROVALS_TABLE_ENTITIES]: new ApprovalTableEntityModule(
      new ApprovalTablesService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.APPROVALS_TABLE_METADATA]: new ApprovalTableMetadataModule(
      new ApprovalTablesMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.ASSESSMENT_FORM_ENTITIES]: new AssessmentFormEntityModule(
      new AssessmentFormsService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.ASSESSMENT_FORM_METADATA]: new AssessmentFormMetadataModule(
      new AssessmentFormsMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.ASSESSMENT_RESPONSE_ENTITIES]: new AssessmentResponseEntityModule(
      new AssessmentResponsesService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.ASSESSMENT_RESPONSE_METADATA]: new AssessmentResponseMetadataModule(
      new AssessmentResponsesMetadataService(httpClient),
      SignalR,
    ).getModule(),
  },
};

export default new Vuex.Store<IRootState>(store);
