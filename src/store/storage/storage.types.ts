import { IStorage as IUserStorage, IStorageMock as IUserStorageMock } from './user';
import { IStorage as IDashboardStorage, IStorageMock as IDashboardStorageMock } from './dashboard';
import { IStorage as IEventStorage, IStorageMock as IEventStorageMock } from './event';

export interface IStorage {
  user: IUserStorage;
  dashboard: IDashboardStorage;
  event: IEventStorage;
}

export interface IStorageMock {
  user: IUserStorageMock;
  dashboard: IDashboardStorageMock;
  event: IEventStorageMock;
}
