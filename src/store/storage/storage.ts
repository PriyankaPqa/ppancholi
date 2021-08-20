import { makeStorage as makeRegistrationStorage } from '@crctech/registration-lib/src/store/storage/registration';
import { HouseholdStorage } from '@crctech/registration-lib/src/store/storage/household';
import * as vuexModule from '@/constants/vuex-modules';
import { UserAccountStorage } from '@/store/storage/user-account/storage';
import { CaseFileStorage } from '@/store/storage/case-file/storage';
import { EventStorage } from '@/store/storage/event/storage';
import { FinancialAssistanceStorage } from '@/store/storage/financial-assistance/storage';
import { MassActionStorage } from '@/store/storage/mass-action';
import { IStore, IState } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeUserStorage } from './user';
import { makeStorage as makeDashboardStorage } from './dashboard';
import { makeStorage as makeOptionListStorage } from './optionList';
import { TeamStorage } from './team';
import { ProgramStorage } from './program';
import { CaseNoteStorage } from './case-note';
import { CaseFileReferralStorage } from './case-file-referral';
import { CaseFileDocumentStorage } from './case-file-document';
import { FinancialAssistanceCategoryStorage } from './financial-assistance-category';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  user: makeUserStorage(store),
  caseFile: new CaseFileStorage(store, vuexModule.CASE_FILE_ENTITIES, vuexModule.CASE_FILE_METADATA).make(),
  caseNote: new CaseNoteStorage(store, vuexModule.CASE_NOTE_ENTITIES, vuexModule.CASE_NOTE_METADATA).make(),
  caseFileReferral: new CaseFileReferralStorage(store, vuexModule.CASE_REFERRAL_ENTITIES, vuexModule.CASE_REFERRAL_METADATA).make(),
  caseFileDocument: new CaseFileDocumentStorage(store, vuexModule.CASE_DOCUMENT_ENTITIES, vuexModule.CASE_DOCUMENT_METADATA).make(),
  dashboard: makeDashboardStorage(store),
  optionList: makeOptionListStorage(store),
  team: new TeamStorage(store, vuexModule.TEAM_ENTITIES, vuexModule.TEAM_METADATA).make(),
  program: new ProgramStorage(store, vuexModule.PROGRAM_ENTITIES, vuexModule.PROGRAM_METADATA).make(),
  registration: makeRegistrationStorage(store),
  financialAssistance: new FinancialAssistanceStorage(
    store,
    vuexModule.FINANCIAL_ASSISTANCE_ENTITIES,
    vuexModule.FINANCIAL_ASSISTANCE_METADATA,
  ).make(),
  household: new HouseholdStorage(store, vuexModule.HOUSEHOLD_ENTITIES, vuexModule.HOUSEHOLD_METADATA).make(),
  userAccount: new UserAccountStorage(store, vuexModule.USER_ACCOUNT_ENTITIES, vuexModule.USER_ACCOUNT_METADATA).make(),
  event: new EventStorage(store, vuexModule.EVENT_ENTITIES, vuexModule.EVENT_METADATA).make(),
  massAction: new MassActionStorage(store, vuexModule.MASS_ACTION_ENTITIES, vuexModule.MASS_ACTION_METADATA).make(),
  financialAssistanceCategory: new FinancialAssistanceCategoryStorage(store, vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES, null).make(),
});
