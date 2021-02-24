import { IStore } from '../store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeUserStorage } from './user';
import { makeStorage as makeDashboardStorage } from './dashboard';
import { makeStorage as makeEventStorage } from './event';
import { makeStorage as makeOptionListStorage } from './optionList';
import { makeStorage as makeTeamStorage } from './team';

export const makeStorage = (store: IStore): IStorage => ({
  user: makeUserStorage(store),
  dashboard: makeDashboardStorage(store),
  event: makeEventStorage(store),
  optionList: makeOptionListStorage(store),
  team: makeTeamStorage(store),
});
