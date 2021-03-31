import { IStore } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeRegistrationStorage } from './registration';
import { makeStorage as makeBeneficiaryStorage } from './beneficiary';

export const makeStorage = (store: IStore): IStorage => ({
  registration: makeRegistrationStorage(store),
  beneficiary: makeBeneficiaryStorage(store),
});
