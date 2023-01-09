import { makeStorage as makeRegistrationStorage } from '@libs/registration-lib/store/storage/registration';
import { HouseholdStorage } from '@libs/registration-lib/store/storage/household';
import * as vuexModule from '@/constants/vuex-modules';
import { UserAccountStorage } from '@/storage/user-account/storage';
import { CaseFileStorage } from '@/storage/case-file/storage';
import { FinancialAssistanceStorage } from '@/storage/financial-assistance/storage';
import { MassActionStorage } from '@/storage/mass-action';
import { ApprovalStorage } from '@/storage/approval-table';
import { IStore, IState } from '../store/store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeOptionListStorage } from './optionList';
import { TeamStorage } from './team';
import { CaseNoteStorage } from './case-note';
import { CaseFileDocumentStorage } from './case-file-document';
import { FinancialAssistanceCategoryStorage } from './financial-assistance-category';
import { FinancialAssistancePaymentStorage } from './financial-assistance-payment';
import { TenantSettingsStorage } from './tenantSettings';
import { AssessmentTemplateStorage } from './assessment-template';
import { AssessmentFormStorage } from './assessment-form';
import { AssessmentResponseStorage } from './assessment-response';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  caseFile: new CaseFileStorage(store, vuexModule.CASE_FILE_ENTITIES, vuexModule.CASE_FILE_METADATA).make(),
  caseNote: new CaseNoteStorage(store, vuexModule.CASE_NOTE_ENTITIES, vuexModule.CASE_NOTE_METADATA).make(),
  caseFileDocument: new CaseFileDocumentStorage(store, vuexModule.CASE_DOCUMENT_ENTITIES, vuexModule.CASE_DOCUMENT_METADATA).make(),
  optionList: makeOptionListStorage(store),
  team: new TeamStorage(store, vuexModule.TEAM_ENTITIES, vuexModule.TEAM_METADATA).make(),
  registration: makeRegistrationStorage(store),
  financialAssistance: new FinancialAssistanceStorage(
    store,
    vuexModule.FINANCIAL_ASSISTANCE_ENTITIES,
    vuexModule.FINANCIAL_ASSISTANCE_METADATA,
  ).make(),
  household: new HouseholdStorage(store, vuexModule.HOUSEHOLD_ENTITIES, vuexModule.HOUSEHOLD_METADATA).make(),
  userAccount: new UserAccountStorage(store, vuexModule.USER_ACCOUNT_ENTITIES, vuexModule.USER_ACCOUNT_METADATA).make(),
  massAction: new MassActionStorage(store, vuexModule.MASS_ACTION_ENTITIES, vuexModule.MASS_ACTION_METADATA).make(),
  financialAssistanceCategory: new FinancialAssistanceCategoryStorage(store, vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES).make(),
  financialAssistancePayment: new FinancialAssistancePaymentStorage(
    store,
    vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES,
    vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA,
  ).make(),
  tenantSettings: new TenantSettingsStorage(
    store,
    vuexModule.TENANT_SETTINGS_ENTITIES,
  ).make(),
  assessmentTemplate: new AssessmentTemplateStorage(
    store,
    vuexModule.ASSESSMENT_TEMPLATE_ENTITIES,
    vuexModule.ASSESSMENT_TEMPLATE_METADATA,
  ).make(),
  approvalTable: new ApprovalStorage(
    store,
    vuexModule.APPROVALS_TABLE_ENTITIES,
    vuexModule.APPROVALS_TABLE_METADATA,
  ).make(),
  assessmentForm: new AssessmentFormStorage(
    store,
    vuexModule.ASSESSMENT_FORM_ENTITIES,
    vuexModule.ASSESSMENT_FORM_METADATA,
  ).make(),
  assessmentResponse: new AssessmentResponseStorage(
    store,
    vuexModule.ASSESSMENT_RESPONSE_ENTITIES,
    vuexModule.ASSESSMENT_RESPONSE_METADATA,
  ).make(),
});
