import { IStorageMake as IHouseholdStorageMake, IStorageMakeMock as IHouseholdStorageMakeMock } from './household';

export interface IStorage {
  household: IHouseholdStorageMake;
  // eslint-disable-next-line
  user?: any;
}

export interface IStorageMock {
  household: IHouseholdStorageMakeMock;
  // eslint-disable-next-line
  user?: any;
}
