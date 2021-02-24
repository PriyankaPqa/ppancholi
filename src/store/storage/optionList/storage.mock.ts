import { IStorageMock } from './storage.types';

export const mockStorageOptionList = () : IStorageMock => ({
  getters: {
    items: jest.fn(),
  },

  mutations: {
    setList: jest.fn(),

    resetState: jest.fn(),
  },

  actions: {
    fetchItems: jest.fn(),

    createOption: jest.fn(),

    updateName: jest.fn(),

    updateStatus: jest.fn(),

    updateOrderRanks: jest.fn(),

    setIsDefault: jest.fn(),

    setIsOther: jest.fn(),
  },
});
