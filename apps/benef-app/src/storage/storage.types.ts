import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@libs/registration-lib/store/storage/registration';
import { IStorageMake, IStorageMakeMock } from '@libs/registration-lib/store/storage/household';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IStorageMake;
  // eslint-disable-next-line
  user?: any; // Otherwise TS complains because of registration library
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IStorageMakeMock;
  // eslint-disable-next-line
  user?: any; // Otherwise TS complains because of registration library
}
