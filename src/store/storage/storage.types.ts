import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from './registration';

export interface IStorage {
  registration: IRegistrationStorage;
}

export interface IStorageMock {
  registration: IRegistrationMock;
}
