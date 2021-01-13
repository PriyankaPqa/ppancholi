import { IStorage as IUserStorage, IMockStorage as IUserStorageMock } from './user';
import { IStorage as IDashboardStorage, IMockStorage as IDashboardStorageMock } from './dashboard';

export interface IStorage {
  user: IUserStorage
  dashboard: IDashboardStorage
}

export interface IMockStorage {
  user: IUserStorageMock;
  dashboard: IDashboardStorageMock;
}
