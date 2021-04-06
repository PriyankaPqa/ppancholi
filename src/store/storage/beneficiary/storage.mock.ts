import { mockBeneficiary, mockContactInformation, mockPerson } from '@/entities/beneficiary';
import _merge from 'lodash/merge';
import { IStorageMock } from './storage.types';

export const mockStorageBeneficiary = (): IStorageMock => ({
  getters: {
    beneficiary: jest.fn(() => mockBeneficiary()),
    personalInformation: jest.fn(() => _merge(mockContactInformation(), mockPerson())),
  },

  mutations: {
    setPersonalInformation: jest.fn(),
    setHomeAddress: jest.fn(),
    setTemporaryAddress: jest.fn(),
    setNoFixedHome: jest.fn(),
    resetTemporaryAddress: jest.fn(),
  },

  actions: {
  },
});
