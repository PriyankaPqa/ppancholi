import { IStore } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeUserStorage } from './user';
import { makeStorage as makeDashboardStorage } from './dashboard';

export const makeStorage = (store: IStore): IStorage => ({
  user: makeUserStorage(store),
  dashboard: makeDashboardStorage(store),
});
