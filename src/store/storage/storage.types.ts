import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from './registration';
import { IStorage as IBeneficiaryStorage, IStorageMock as IBeneficiaryMock } from './beneficiary';

export interface IStorage {
  registration: IRegistrationStorage;
  beneficiary: IBeneficiaryStorage;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  beneficiary: IBeneficiaryMock;
}
