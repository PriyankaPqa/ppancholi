import { IStorageMock } from './storage.types';

export const mockStorageBeneficiary = (): IStorageMock => ({
  getters: {
    beneficiary: jest.fn(),
  },

  mutations: {
    setPersonalInformation: jest.fn(),
    setAddresses: jest.fn(),
  },

  actions: {
  },
});
