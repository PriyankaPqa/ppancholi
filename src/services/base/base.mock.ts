import { IDomainBaseServiceMock } from './base.types';
/* eslint-disable @typescript-eslint/no-explicit-any */
export const mockDomainBaseService = (entities: any): IDomainBaseServiceMock<any> => ({
  get: jest.fn(() => entities[0]),
  getAll: jest.fn(() => entities),
  getAllIncludingInactive: jest.fn(() => entities),
  activate: jest.fn(() => entities[0]),
  deactivate: jest.fn(() => entities[0]),
  search: jest.fn(() => ({ odataContext: '', odataCount: 0, value: [] })),
});
