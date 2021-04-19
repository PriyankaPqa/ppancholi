import { mockBeneficiary, mockContactInformation, mockPerson } from '@/entities/beneficiary';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import { IStorageMock } from './storage.types';

export const mockStorageBeneficiary = (): IStorageMock => ({
  getters: {
    beneficiary: jest.fn(() => _cloneDeep(mockBeneficiary())),
    personalInformation: jest.fn(() => _merge(mockContactInformation(), mockPerson())),
  },

  mutations: {
    setPersonalInformation: jest.fn(),
    setPerson: jest.fn(),
    setIdentity: jest.fn(),
    setIndigenousIdentity: jest.fn(),
    setContactInformation: jest.fn(),
    setHomeAddress: jest.fn(),
    setTemporaryAddress: jest.fn(),
    setNoFixedHome: jest.fn(),
    resetTemporaryAddress: jest.fn(),
    addHouseholdMember: jest.fn(),
    removeHouseholdMember: jest.fn(),
    editHouseholdMember: jest.fn(),
  },

  actions: {
  },
});
