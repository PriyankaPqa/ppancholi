import { makeStorage as makeRegistrationStorage } from '@crctech/registration-lib/src/store/storage/registration';
import { makeStorage as makeHouseholdStorage } from '@crctech/registration-lib/src/store/storage/household';
import { IStore, IState } from '../store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  registration: makeRegistrationStorage(store),
  household: makeHouseholdStorage(store),
});
