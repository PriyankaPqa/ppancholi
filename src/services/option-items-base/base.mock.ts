/* eslint-disable @typescript-eslint/no-explicit-any */
import { IOptionItemBaseServiceMock } from '@/services/option-items-base/base.types';
import { mockDomainBaseService } from '@/services/base/base.mock';

export const mockOptionItemDomainBaseService = (entities: any): IOptionItemBaseServiceMock => ({
  ...mockDomainBaseService(entities),
  createOptionItem: jest.fn(() => entities[0]),
  addSubItem: jest.fn(() => entities[0]),
  updateOptionItem: jest.fn(() => entities[0]),
  updateOptionSubItem: jest.fn(() => entities[0]),
  updateOptionItemStatus: jest.fn(() => entities[0]),
  updateOptionSubItemStatus: jest.fn(() => entities[0]),
  updateOptionItemOrderRanks: jest.fn(() => entities),
  updateOptionSubItemOrderRanks: jest.fn(() => entities),
  setOptionItemIsOther: jest.fn(() => entities[0]),
  setOptionItemIsDefault: jest.fn(() => entities[0]),
});
