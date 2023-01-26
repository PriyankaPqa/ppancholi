import { IStorageMake, IStorageMakeMock } from '@libs/registration-lib/store/storage/household';

export interface IStorage {
  household: IStorageMake;
  // eslint-disable-next-line
  user?: any; // Otherwise TS complains because of registration library
}

export interface IStorageMock {
  household: IStorageMakeMock;
  // eslint-disable-next-line
  user?: any; // Otherwise TS complains because of registration library
}
