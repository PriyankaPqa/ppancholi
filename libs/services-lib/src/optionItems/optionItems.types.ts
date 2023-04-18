import {
  IOptionItemData, EOptionLists, IOptionSubItem,
} from '@libs/entities-lib/optionItem';
import { IMultilingual } from '@libs/shared-lib/types';

import { Status } from '@libs/entities-lib/base';

export interface IOptionItemsService {
  getOptionList(target: EOptionLists): Promise<IOptionItemData[]>;

  createOptionItem(target: EOptionLists, eventType: IOptionItemData): Promise<IOptionItemData>;

  addSubItem(target: EOptionLists, itemId: string, subItem: IOptionSubItem): Promise<IOptionItemData>;

  updateOptionItem(target: EOptionLists, id: string, name: IMultilingual, description: IMultilingual): Promise<IOptionItemData>;

  updateOptionSubItem(
    target: EOptionLists,
    itemId: string,
    subItemId: string,
    name: IMultilingual,
    description: IMultilingual,
  ): Promise<IOptionItemData>;

  updateOptionItemStatus(target: EOptionLists, id: string, status: Status): Promise<IOptionItemData>;

  updateOptionSubItemStatus(target: EOptionLists, itemId: string, subItemId: string, status: Status): Promise<IOptionItemData>;

  updateOptionItemOrderRanks(target: EOptionLists, orders: Record<string, number>): Promise<IOptionItemData[]>;

  updateOptionSubItemOrderRanks(target: EOptionLists, itemId: string, reOrders: Record<string, number>): Promise<IOptionItemData[]>;

  setOptionItemIsOther(target: EOptionLists, id: string, isOther: boolean): Promise<IOptionItemData>;

  setOptionItemIsDefault(target: EOptionLists, id: string, isDefault: boolean): Promise<IOptionItemData>;

  setOptionItemRestrictFinancial(target: EOptionLists, id: string, restrictFinancial: boolean): Promise<IOptionItemData>;
}

export interface IOptionItemsServiceMock {
  getOptionList: jest.Mock<IOptionItemData[]>;

  createOptionItem: jest.Mock<IOptionItemData>;

  addSubItem: jest.Mock<IOptionItemData>;

  updateOptionItem: jest.Mock<IOptionItemData>;

  updateOptionSubItem: jest.Mock<IOptionItemData>;

  updateOptionItemStatus: jest.Mock<IOptionItemData>;

  updateOptionSubItemStatus: jest.Mock<IOptionItemData>;

  updateOptionItemOrderRanks: jest.Mock<IOptionItemData[]>;

  updateOptionSubItemOrderRanks: jest.Mock<IOptionItemData[]>;

  setOptionItemIsOther: jest.Mock<IOptionItemData>;

  setOptionItemIsDefault: jest.Mock<IOptionItemData>;

  setOptionItemRestrictFinancial: jest.Mock<IOptionItemData>;
}
