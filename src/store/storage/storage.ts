import { makeStorage as makeRegistrationStorage } from '@crctech/registration-lib/src/store/storage/registration';
import { makeStorage as makeBeneficiaryStorage } from '@crctech/registration-lib/src/store/storage/beneficiary';
import { IStore } from '../store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore): IStorage => ({
  registration: makeRegistrationStorage(store),
  beneficiary: makeBeneficiaryStorage(store),
});
