import { IEntity } from '@/entities/base/base.types';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@/types';
import { IRestResponse } from '@/services/httpClient';

export interface IDomainBaseService<T extends IEntity, IdParams> {
  get(idParams: IdParams, useGlobalHandler?: boolean): Promise<T | IRestResponse<T>>;
  getFullResponse(idParams: IdParams, useGlobalHandler?: boolean): Promise<IRestResponse<T>>;
  getAll(parentId?: Omit<IdParams, 'id'>): Promise<T[]>;
  getAllIncludingInactive(): Promise<T[]>;
  activate(idParams: IdParams): Promise<T>;
  deactivate(idParams: IdParams): Promise<T>;
  search(params: IAzureSearchParams, searchEndpoint?: string): Promise<IAzureCombinedSearchResult<T, unknown>>;
}

export interface IDomainBaseServiceMock <T extends IEntity> {
  get: jest.Mock<T>;
  getAll: jest.Mock<Array<T>>;
  getAllIncludingInactive: jest.Mock<Array<T>>;
  activate: jest.Mock<T>;
  deactivate: jest.Mock<T>;
  search: jest.Mock<IAzureCombinedSearchResult<T, unknown>>;
}
