import {
  Beneficiary, IAddresses, IContactInformation, IPerson,
} from '@/entities/beneficiary';

export interface IStorage {
  getters: {
    beneficiary(): Beneficiary,
    personalInformation(): IContactInformation & IPerson,
  };

  mutations: {
    setPersonalInformation(payload: IContactInformation & IPerson): void;
    setAddresses(payload: IAddresses): void;
  };

  actions: {

  };
}

export interface IStorageMock {
  getters: {
    beneficiary: jest.Mock<void>;
    personalInformation: jest.Mock<IContactInformation & IPerson>;
  };

  mutations: {
    setPersonalInformation: jest.Mock<void>;
    setAddresses: jest.Mock<void>;
  };

  actions: {

  };
}
