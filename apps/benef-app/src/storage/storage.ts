import { makeStorage as makeRegistrationStorage } from '@libs/registration-lib/store/storage/registration';
import { HouseholdStorage } from '@libs/registration-lib/store/storage/household';
import * as vuexModule from '../constants/vuex-modules';
import { IStore, IState } from '../store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  registration: makeRegistrationStorage(store),
  household: new HouseholdStorage(store, vuexModule.HOUSEHOLD_ENTITIES, vuexModule.HOUSEHOLD_METADATA).make(),
});
