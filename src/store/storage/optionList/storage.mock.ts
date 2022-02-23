import { IStorageMock } from './storage.types';
import { mockOptionItemData } from '@/entities/optionItem';

export const mockStorageOptionList = () : IStorageMock => ({
  getters: {
    items: jest.fn(),
  },

  mutations: {
    setList: jest.fn(),

    resetState: jest.fn(),
  },

  actions: {
    fetchItems: jest.fn(() => mockOptionItemData()),

    fetchSubItems: jest.fn(),

    createOption: jest.fn(),

    addSubItem: jest.fn(),

    updateItem: jest.fn(),

    updateSubItem: jest.fn(),

    updateStatus: jest.fn(),

    updateSubItemStatus: jest.fn(),

    updateOrderRanks: jest.fn(),

    updateSubItemOrderRank: jest.fn(),

    setIsDefault: jest.fn(),

    setIsOther: jest.fn(),
  },
});
