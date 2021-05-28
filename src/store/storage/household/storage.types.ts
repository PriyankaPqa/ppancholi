import {
  HouseholdCreate, IAddress, IHouseholdCreate, IContactInformation, IMember, ICurrentAddress, IIdentitySet,
} from '../../../entities/household-create';

export interface IStorage {
  getters: {
    householdCreate(): HouseholdCreate;
    personalInformation(): IContactInformation & IMember;
  };

  mutations: {
    setPersonalInformation(payload: IContactInformation & IMember): void;
    setPrimaryBeneficiary(payload: IMember): void;
    setIdentity(payload: IIdentitySet): void;
    setIndigenousIdentity(payload: IIdentitySet): void;
    setContactInformation(payload: IContactInformation): void;
    setHomeAddress(payload: IAddress): void;
    setCurrentAddress(payload: ICurrentAddress): void;
    setNoFixedHome(payload: boolean): void;
    addAdditionalMember(payload: IMember, sameAddress: boolean): void;
    removeAdditionalMember(index: number): void;
    editAdditionalMember(payload: IMember, index: number, sameAddress: boolean): void;
    resetState(): void;
  };

  actions: {

  };
}

export interface IStorageMock {
  getters: {
    householdCreate: jest.Mock<IHouseholdCreate>;
    personalInformation: jest.Mock<IContactInformation & IMember>;
  };

  mutations: {
    setPersonalInformation: jest.Mock<void>;
    setPrimaryBeneficiary: jest.Mock<void>;
    setIdentity: jest.Mock<void>;
    setIndigenousIdentity: jest.Mock<void>;
    setContactInformation: jest.Mock<void>;
    setHomeAddress: jest.Mock<void>;
    setCurrentAddress: jest.Mock<void>;
    setNoFixedHome: jest.Mock<void>;
    resetCurrentAddress: jest.Mock<void>;
    addAdditionalMember: jest.Mock<void>;
    removeAdditionalMember: jest.Mock<void>;
    editAdditionalMember: jest.Mock<void>;
    resetState: jest.Mock<void>;
  };

  actions: {

  };
}
