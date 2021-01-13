import { IStorage as IUserStorage } from './user';
import { IStorage as IDashboardStorage } from './dashboard';

export interface IStorage {
  user: IUserStorage
  dashboard: IDashboardStorage
}
