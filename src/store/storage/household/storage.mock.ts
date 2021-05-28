import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import { mockHouseholdCreate, mockContactInformation, mockMember } from '../../../entities/household-create';
import { IStorageMock } from './storage.types';

export const mockStorageHousehold = (): IStorageMock => ({
  getters: {
    householdCreate: jest.fn(() => _cloneDeep(mockHouseholdCreate())),
    personalInformation: jest.fn(() => _merge(mockContactInformation(), mockMember())),
  },

  mutations: {
    setPersonalInformation: jest.fn(),
    setPrimaryBeneficiary: jest.fn(),
    setIdentity: jest.fn(),
    setIndigenousIdentity: jest.fn(),
    setContactInformation: jest.fn(),
    setHomeAddress: jest.fn(),
    setCurrentAddress: jest.fn(),
    setNoFixedHome: jest.fn(),
    resetCurrentAddress: jest.fn(),
    addAdditionalMember: jest.fn(),
    removeAdditionalMember: jest.fn(),
    editAdditionalMember: jest.fn(),
    resetState: jest.fn(),
  },

  actions: {
  },
});
