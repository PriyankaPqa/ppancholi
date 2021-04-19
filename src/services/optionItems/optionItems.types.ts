import {
  IOptionItemData, EOptionListItemStatus, EOptionLists, IOptionSubItem,
} from '@/entities/optionItem';
import { IMultilingual } from '@/types';

export interface IOptionItemsService {
  getOptionList(target: EOptionLists): Promise<IOptionItemData[]>;

  createOptionItem(target: EOptionLists, eventType: IOptionItemData): Promise<IOptionItemData>;

  addSubItem(target: EOptionLists, itemId: string, subItem: IOptionSubItem): Promise<IOptionItemData>;

  updateOptionItemName(target: EOptionLists, id: string, name: IMultilingual): Promise<IOptionItemData>;

  updateOptionSubItem(
    target: EOptionLists,
    itemId: string,
    subItemId: string,
    name: IMultilingual,
    description: IMultilingual,
  ): Promise<IOptionItemData>;

  updateOptionItemStatus(target: EOptionLists, id: string, status: EOptionListItemStatus): Promise<IOptionItemData>;

  updateOptionSubItemStatus(target: EOptionLists, itemId: string, subItemId: string, status: EOptionListItemStatus): Promise<IOptionItemData>;

  updateOptionItemOrderRanks(target: EOptionLists, orders: Record<string, number>): Promise<IOptionItemData[]>;

  updateOptionSubItemOrderRanks(target: EOptionLists, itemId: string, reOrders: Record<string, number>): Promise<IOptionItemData[]>;

  setOptionItemIsOther(target: EOptionLists, id: string, isOther: boolean): Promise<IOptionItemData>;

  setOptionItemIsDefault(target: EOptionLists, id: string, isDefault: boolean): Promise<IOptionItemData>;
}

export interface IOptionItemsServiceMock {
  getOptionList: jest.Mock<IOptionItemData[]>;

  createOptionItem: jest.Mock<IOptionItemData>;

  addSubItem: jest.Mock<IOptionItemData>;

  updateOptionItemName: jest.Mock<IOptionItemData>;

  updateOptionSubItem: jest.Mock<IOptionItemData>;

  updateOptionItemStatus: jest.Mock<IOptionItemData>;

  updateOptionSubItemStatus: jest.Mock<IOptionItemData>;

  updateOptionItemOrderRanks: jest.Mock<IOptionItemData[]>;

  updateOptionSubItemOrderRanks: jest.Mock<IOptionItemData[]>;

  setOptionItemIsOther: jest.Mock<IOptionItemData>;

  setOptionItemIsDefault: jest.Mock<IOptionItemData>;
}
