import { IStore } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeRegistrationStorage } from './registration';

export const makeStorage = (store: IStore): IStorage => ({
  registration: makeRegistrationStorage(store),
});
