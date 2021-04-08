import {
  Beneficiary, ETemporaryAddressTypes, IAddress, IBeneficiary, IContactInformation, IPerson,
} from '@/entities/beneficiary';

export interface IStorage {
  getters: {
    beneficiary(): Beneficiary,
    personalInformation(): IContactInformation & IPerson,
  };

  mutations: {
    setPersonalInformation(payload: IContactInformation & IPerson): void;
    setHomeAddress(payload: IAddress): void;
    setTemporaryAddress(payload: IAddress): void;
    setNoFixedHome(payload: boolean): void;
    resetTemporaryAddress(type: ETemporaryAddressTypes): void;
    addHouseholdMember(payload: IPerson, sameAddress: boolean): void;
    removeHouseholdMember(index: number): void;
    editHouseholdMember(payload: IPerson, index: number, sameAddress: boolean): void;
  };

  actions: {

  };
}

export interface IStorageMock {
  getters: {
    beneficiary: jest.Mock<IBeneficiary>;
    personalInformation: jest.Mock<IContactInformation & IPerson>;
  };

  mutations: {
    setPersonalInformation: jest.Mock<void>;
    setHomeAddress: jest.Mock<void>;
    setTemporaryAddress: jest.Mock<void>;
    setNoFixedHome: jest.Mock<void>;
    resetTemporaryAddress: jest.Mock<void>;
    addHouseholdMember: jest.Mock<void>;
    removeHouseholdMember: jest.Mock<void>;
    editHouseholdMember: jest.Mock<void>;
  };

  actions: {

  };
}
