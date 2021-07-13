import * as vuexModule from '@/constants/vuex-modules';
import { makeStorage as makeRegistrationStorage } from '@crctech/registration-lib/src/store/storage/registration';
import { HouseholdStorage } from '@crctech/registration-lib/src/store/storage/household';
import { UserAccountStorage } from '@/store/storage/user-account/storage';
import { CaseFileStorage } from '@/store/storage/case-file/storage';
import { EventStorage } from '@/store/storage/event/storage';
import { IStore, IState } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeUserStorage } from './user';
import { makeStorage as makeDashboardStorage } from './dashboard';
import { makeStorage as makeOptionListStorage } from './optionList';
import { makeStorage as makeTeamStorage } from './team';
import { makeStorage as makeProgramStorage } from './program';
import { makeStorage as makeFinancialAssistanceStorage } from './financial-assistance';
import { CaseNoteStorage } from './case-note';
import { CaseFileReferralStorage } from './case-file-referral';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  user: makeUserStorage(store),
  caseFile: new CaseFileStorage(store, vuexModule.CASE_FILE_ENTITIES, vuexModule.CASE_FILE_METADATA).make(),
  caseNote: new CaseNoteStorage(store, vuexModule.CASE_NOTE_ENTITIES, vuexModule.CASE_NOTE_METADATA).make(),
  caseFileReferral: new CaseFileReferralStorage(store, vuexModule.CASE_REFERRAL_ENTITIES, vuexModule.CASE_REFERRAL_METADATA).make(),
  dashboard: makeDashboardStorage(store),
  optionList: makeOptionListStorage(store),
  team: makeTeamStorage(store),
  program: makeProgramStorage(store),
  registration: makeRegistrationStorage(store),
  financialAssistance: makeFinancialAssistanceStorage(store),
  household: new HouseholdStorage(store, vuexModule.HOUSEHOLD_ENTITIES, vuexModule.HOUSEHOLD_METADATA).make(),
  userAccount: new UserAccountStorage(store, vuexModule.USER_ACCOUNT_ENTITIES, vuexModule.USER_ACCOUNT_METADATA).make(),
  event: new EventStorage(store, vuexModule.EVENT_ENTITIES, vuexModule.EVENT_METADATA).make(),
});
