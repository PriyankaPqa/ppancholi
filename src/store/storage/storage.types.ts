import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorageMake, IStorageMakeMock } from '@crctech/registration-lib/src/store/storage/household';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IStorageMake;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IStorageMakeMock;
}
