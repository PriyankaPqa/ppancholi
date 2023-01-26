import { IMultilingual } from '@libs/shared-lib/types';
import { ICreateOptionItemRequest, IOptionItemData, IOptionSubItem } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IOptionItemBaseService extends IDomainBaseService<IOptionItemData, uuid> {
  createOptionItem(optionItem: ICreateOptionItemRequest): Promise<IOptionItemData>
  addSubItem(itemId: string, subItem: IOptionSubItem): Promise<IOptionItemData>
  updateOptionItem(id: string, name: IMultilingual, description: IMultilingual): Promise<IOptionItemData>
  updateOptionSubItem(itemId: string, subItemId: string, name: IMultilingual, description: IMultilingual,): Promise<IOptionItemData>
  updateOptionItemStatus(id: string, status: Status): Promise<IOptionItemData>
  updateOptionSubItemStatus(itemId: string, subItemId: string, status: Status): Promise<IOptionItemData>
  updateOptionItemOrderRanks(reOrders: Record<string, number>): Promise<IOptionItemData[]>
  updateOptionSubItemOrderRanks(itemId: string, reOrders: Record<string, number>): Promise<IOptionItemData[]>
  setOptionItemIsOther(id: string, isOther: boolean): Promise<IOptionItemData>
  setOptionItemIsDefault(id: string, isDefault: boolean): Promise<IOptionItemData>
}

export interface IOptionItemBaseServiceMock extends IDomainBaseServiceMock<IOptionItemData> {
  createOptionItem: jest.Mock<IOptionItemData>;
  addSubItem: jest.Mock<IOptionItemData>;
  updateOptionItem: jest.Mock<IOptionItemData>;
  updateOptionSubItem: jest.Mock<IOptionItemData>;
  updateOptionItemStatus:jest.Mock<IOptionItemData>;
  updateOptionSubItemStatus: jest.Mock<IOptionItemData>;
  updateOptionItemOrderRanks: jest.Mock<IOptionItemData[]>;
  updateOptionSubItemOrderRanks: jest.Mock<IOptionItemData[]>;
  setOptionItemIsOther: jest.Mock<IOptionItemData>;
  setOptionItemIsDefault: jest.Mock<IOptionItemData>;
}
