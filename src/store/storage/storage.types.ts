import { IStorage as IUserStorage, IStorageMock as IUserStorageMock } from './user';
import { IStorage as IDashboardStorage, IStorageMock as IDashboardStorageMock } from './dashboard';

export interface IStorage {
  user: IUserStorage
  dashboard: IDashboardStorage
}

export interface IStorageMock {
  user: IUserStorageMock
  dashboard: IDashboardStorageMock
}
