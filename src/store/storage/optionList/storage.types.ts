import {
  EOptionListItemStatus, EOptionLists, IMultilingual, IOptionListItem,
} from '@/types';

export interface IStorage {
  getters: {
    items(): Array<IOptionListItem>;
  }

  mutations: {
    setList(payload: EOptionLists): void;

    resetState(): void;
  }

  actions: {
    fetchItems(): Promise<IOptionListItem[]>;

    createOption(payload: IOptionListItem): Promise<IOptionListItem>;

    updateName(id: string, name: IMultilingual): Promise<IOptionListItem>;

    updateStatus(id: string, status: EOptionListItemStatus): Promise<IOptionListItem>;

    updateOrderRanks(payload: Array<IOptionListItem>): Promise<IOptionListItem[]>;

    setIsOther(id: string, isOther: boolean): Promise<IOptionListItem>;

    setIsDefault(id: string, isDefault: boolean): Promise<IOptionListItem>;
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
    fetchItems: jest.Mock<void>;

    createOption: jest.Mock<void>;

    updateName: jest.Mock<void>;

    updateStatus: jest.Mock<void>;

    updateOrderRanks: jest.Mock<void>;

    setIsOther: jest.Mock<void>;

    setIsDefault: jest.Mock<void>;
  }
}
