import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from './registration';
import { IStorageMake as IHouseholdStorageMake, IStorageMakeMock as IHouseholdStorageMakeMock } from './household';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IHouseholdStorageMake;
  // eslint-disable-next-line
  user?: any;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IHouseholdStorageMakeMock;
  // eslint-disable-next-line
  user?: any;
}
