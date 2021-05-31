import { makeStorage as makeRegistrationStorage } from '@crctech/registration-lib/src/store/storage/registration';
import { makeStorage as makeHouseholdStorage } from '@crctech/registration-lib/src/store/storage/household';
import { IStore, IState } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeUserStorage } from './user';
import { makeStorage as makeCaseFileStorage } from './case-file';
import { makeStorage as makeDashboardStorage } from './dashboard';
import { makeStorage as makeEventStorage } from './event';
import { makeStorage as makeOptionListStorage } from './optionList';
import { makeStorage as makeTeamStorage } from './team';
import { makeStorage as makeAppUserStorage } from './app-user';
import { makeStorage as makeUserAccountStorage } from './user-account';
import { makeStorage as makeProgramStorage } from './program';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  appUser: makeAppUserStorage(store),
  user: makeUserStorage(store),
  userAccount: makeUserAccountStorage(store),
  caseFile: makeCaseFileStorage(store),
  dashboard: makeDashboardStorage(store),
  event: makeEventStorage(store),
  optionList: makeOptionListStorage(store),
  team: makeTeamStorage(store),
  program: makeProgramStorage(store),
  registration: makeRegistrationStorage(store),
  household: makeHouseholdStorage(store),
});
