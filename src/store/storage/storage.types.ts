import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorage as IHouseholdStorage, IStorageMock as IHouseholdMock } from '@crctech/registration-lib/src/store/storage/household';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IHouseholdStorage;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IHouseholdMock;
}
