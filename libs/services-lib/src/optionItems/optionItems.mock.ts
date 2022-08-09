import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { IOptionItemsServiceMock } from './optionItems.types';

export const mockOptionItemsServiceService = (): IOptionItemsServiceMock => ({
  getOptionList: jest.fn(() => mockOptionItemData()),

  createOptionItem: jest.fn(() => mockOptionItemData()[0]),

  addSubItem: jest.fn(() => mockOptionItemData()[0]),

  updateOptionItem: jest.fn(() => mockOptionItemData()[0]),

  updateOptionSubItem: jest.fn(() => mockOptionItemData()[0]),

  updateOptionItemStatus: jest.fn(() => mockOptionItemData()[0]),

  updateOptionSubItemStatus: jest.fn(() => mockOptionItemData()[0]),

  updateOptionItemOrderRanks: jest.fn(() => mockOptionItemData()),

  updateOptionSubItemOrderRanks: jest.fn(() => mockOptionItemData()),

  setOptionItemIsOther: jest.fn(() => mockOptionItemData()[0]),

  setOptionItemIsDefault: jest.fn(() => mockOptionItemData()[0]),
});
