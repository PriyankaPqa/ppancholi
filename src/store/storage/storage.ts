import { makeStorage as makeRegistrationStorage } from '@crctech/registration-lib/src/store/storage/registration';
import { HouseholdStorage } from '@crctech/registration-lib/src/store/storage/household';
import { UserAccountStorage } from '@/store/storage/user-account/storage';
import * as vuexModule from '@/constants/vuex-modules';
import { IStore, IState } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeUserStorage } from './user';
import { makeStorage as makeCaseFileStorage } from './case-file';
import { makeStorage as makeDashboardStorage } from './dashboard';
import { makeStorage as makeEventStorage } from './event';
import { makeStorage as makeOptionListStorage } from './optionList';
import { makeStorage as makeTeamStorage } from './team';
import { makeStorage as makeProgramStorage } from './program';
import { makeStorage as makeFinancialAssistanceStorage } from './financial-assistance';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  user: makeUserStorage(store),
  caseFile: makeCaseFileStorage(store),
  dashboard: makeDashboardStorage(store),
  event: makeEventStorage(store),
  optionList: makeOptionListStorage(store),
  team: makeTeamStorage(store),
  program: makeProgramStorage(store),
  registration: makeRegistrationStorage(store),
  financialAssistance: makeFinancialAssistanceStorage(store),
  household: new HouseholdStorage(store, vuexModule.HOUSEHOLD_ENTITIES, vuexModule.HOUSEHOLD_METADATA).make(),
  userAccount: new UserAccountStorage(store, vuexModule.USER_ACCOUNT_ENTITIES, vuexModule.USER_ACCOUNT_METADATA).make(),
});
