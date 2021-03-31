import { Beneficiary, IAddresses, IPersonalInformation } from '@/entities/beneficiary';

export interface IStorage {
  getters: {
    beneficiary(): Beneficiary,
  };

  mutations: {
    setPersonalInformation(payload: IPersonalInformation): void;
    setAddresses(payload: IAddresses): void;
  };

  actions: {

  };
}

export interface IStorageMock {
  getters: {
    beneficiary: jest.Mock<void>;
  };

  mutations: {
    setPersonalInformation: jest.Mock<void>;
    setAddresses: jest.Mock<void>;
  };

  actions: {

  };
}
