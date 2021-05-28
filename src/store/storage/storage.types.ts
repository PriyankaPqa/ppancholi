import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from './registration';
import { IStorage as IHouseholdStorage, IStorageMock as IHouseholdMock } from './household';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IHouseholdStorage;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IHouseholdMock;
}
