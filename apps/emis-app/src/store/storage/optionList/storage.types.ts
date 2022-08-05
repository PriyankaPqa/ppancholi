import { IMultilingual } from '@libs/core-lib/types';

import {
  OptionItem, IOptionItem, EOptionLists, ICreateOptionItemRequest, IOptionSubItem,
} from '@libs/entities-lib/optionItem';

import { Status } from '@libs/entities-lib/base';

export interface IStorage {
  getters: {
    items(): Array<OptionItem>;
  }

  mutations: {
    setList(payload: EOptionLists): void;

    resetState(): void;
  }

  actions: {
    fetchItems(): Promise<IOptionItem[]>;

    fetchSubItems(): Promise<IOptionSubItem[]>;

    createOption(payload: ICreateOptionItemRequest): Promise<IOptionItem>;

    addSubItem(itemId: string, payload: ICreateOptionItemRequest): Promise<IOptionItem>;

    updateItem(id: string, name: IMultilingual, description: IMultilingual): Promise<IOptionItem>;

    updateSubItem(itemId: string, subItemId: string, name: IMultilingual, description: IMultilingual): Promise<IOptionItem>;

    updateStatus(id: string, status: Status): Promise<IOptionItem>;

    updateSubItemStatus(itemId: string, subItemId: string, status: Status): Promise<IOptionItem>;

    updateOrderRanks(payload: Array<IOptionItem>): Promise<IOptionItem[]>;

    updateSubItemOrderRanks(newItem: IOptionItem): Promise<IOptionItem>;

    setIsOther(id: string, isOther: boolean): Promise<IOptionItem>;

    setIsDefault(id: string, isDefault: boolean): Promise<IOptionItem>;
  }
}

export interface IStorageMock {
  getters: {
    items: jest.Mock<void>;
  }

  mutations: {
    setList: jest.Mock<void>;

    resetState: jest.Mock<void>;
  }

  actions: {
    fetchItems: jest.Mock<IOptionItem[]>;

    fetchSubItems: jest.Mock<void>;

    createOption: jest.Mock<void>;

    addSubItem: jest.Mock<void>;

    updateItem: jest.Mock<void>;

    updateSubItem: jest.Mock<void>;

    updateStatus: jest.Mock<void>;

    updateSubItemStatus: jest.Mock<void>;

    updateOrderRanks: jest.Mock<void>;

    updateSubItemOrderRank: jest.Mock<void>;

    setIsOther: jest.Mock<void>;

    setIsDefault: jest.Mock<void>;
  }
}
