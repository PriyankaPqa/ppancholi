import {
  Beneficiary, ETemporaryAddressTypes, IAddress, IBeneficiary, IContactInformation, IPerson, ITemporaryAddress,
} from '@/entities/beneficiary';

export interface IStorage {
  getters: {
    beneficiary(): Beneficiary,
    personalInformation(): IContactInformation & IPerson,
  };

  mutations: {
    setPersonalInformation(payload: IContactInformation & IPerson): void;
    setPerson(payload: IPerson): void;
    setIdentity(payload: IPerson): void;
    setIndigenousIdentity(payload: IPerson): void;
    setContactInformation(payload: IContactInformation): void;
    setHomeAddress(payload: IAddress): void;
    setTemporaryAddress(payload: ITemporaryAddress): void;
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
    setPerson: jest.Mock<void>;
    setIdentity: jest.Mock<void>;
    setIndigenousIdentity: jest.Mock<void>;
    setContactInformation: jest.Mock<void>;
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
