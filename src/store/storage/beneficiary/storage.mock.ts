import { mockContactInformation, mockPerson } from '@/entities/beneficiary';
import _merge from 'lodash/merge';
import { IStorageMock } from './storage.types';

export const mockStorageBeneficiary = (): IStorageMock => ({
  getters: {
    beneficiary: jest.fn(),
    personalInformation: jest.fn(() => _merge(mockContactInformation(), mockPerson())),
  },

  mutations: {
    setPersonalInformation: jest.fn(),
    setAddresses: jest.fn(),
  },

  actions: {
  },
});
