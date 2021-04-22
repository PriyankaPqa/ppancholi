import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorage as IBeneficiaryStorage, IStorageMock as IBeneficiaryMock } from '@crctech/registration-lib/src/store/storage/beneficiary';

export interface IStorage {
  registration: IRegistrationStorage;
  beneficiary: IBeneficiaryStorage;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  beneficiary: IBeneficiaryMock;
}
