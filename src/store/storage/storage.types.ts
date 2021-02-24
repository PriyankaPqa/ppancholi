import { IStorage as IUserStorage, IStorageMock as IUserStorageMock } from './user';
import { IStorage as IDashboardStorage, IStorageMock as IDashboardStorageMock } from './dashboard';
import { IStorage as IEventStorage, IStorageMock as IEventStorageMock } from './event';
import { IStorage as ITeamStorage, IStorageMock as ITeamStorageMock } from './team';

export interface IStorage {
  user: IUserStorage;
  dashboard: IDashboardStorage;
  event: IEventStorage;
  team: ITeamStorage;
}

export interface IStorageMock {
  user: IUserStorageMock;
  dashboard: IDashboardStorageMock;
  event: IEventStorageMock;
  team: ITeamStorageMock;
}
