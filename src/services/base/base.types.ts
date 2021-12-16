import { IEntity } from '../../entities/base/base.types';
import { IAzureSearchParams } from '../../types';
import { IAzureCombinedSearchResult } from '../../types/interfaces/IAzureSearchResult';

export interface IDomainBaseService<T extends IEntity> {
  get(id: uuid, useGlobalHandler?: boolean): Promise<T>;
  getAll(): Promise<T[]>;
  getAllIncludingInactive(): Promise<T[]>;
  activate(id: uuid): Promise<T>;
  deactivate(id: uuid): Promise<T>;
  search(params: IAzureSearchParams, searchEndpoint?: string): Promise<IAzureCombinedSearchResult<T, unknown>>;
}

export interface IDomainBaseServiceMock <T extends IEntity> {
  get: jest.Mock<T>;
  getAll: jest.Mock<Array<T>>;
  getAllIncludingInactive: jest.Mock<Array<T>>;
  activate: jest.Mock<T>;
  deactivate: jest.Mock<T>;
  search: jest.Mock<Array<T>>;
}
