import { IOptionItemData } from '@/entities/optionItem';
import { EOptionLists, IMultilingual } from '@/types';
import { EOptionListItemStatus } from '@/types/enums/EOptionListItemStatus';

export interface IOptionItemsService {
  getOptionList(target: EOptionLists): Promise<IOptionItemData[]>;

  createOptionItem(target: EOptionLists, eventType: IOptionItemData): Promise<IOptionItemData>;

  updateOptionItemName(target: EOptionLists, id: string, name: IMultilingual): Promise<IOptionItemData>;

  updateOptionItemStatus(target: EOptionLists, id: string, status: EOptionListItemStatus): Promise<IOptionItemData>;

  updateOptionItemOrderRanks(target: EOptionLists, orders: Record<string, number>): Promise<IOptionItemData[]>;

  setOptionItemIsOther(target: EOptionLists, id: string, isOther: boolean): Promise<IOptionItemData>;

  setOptionItemIsDefault(target: EOptionLists, id: string, isDefault: boolean): Promise<IOptionItemData>;
}

export interface IOptionItemsServiceMock {
  getOptionList: jest.Mock<IOptionItemData[]>;

  createOptionItem: jest.Mock<IOptionItemData>;

  updateOptionItemName: jest.Mock<IOptionItemData>;

  updateOptionItemStatus: jest.Mock<IOptionItemData>;

  updateOptionItemOrderRanks: jest.Mock<IOptionItemData[]>;

  setOptionItemIsOther: jest.Mock<IOptionItemData>;

  setOptionItemIsDefault: jest.Mock<IOptionItemData>;
}
