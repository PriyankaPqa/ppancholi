import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from './registration';
import { IStorageMake as IHouseholdStorageMake, IStorageMakeMock as IHouseholdStorageMakeMock } from './household';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IHouseholdStorageMake;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IHouseholdStorageMakeMock;
}
