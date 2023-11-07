import { IEntity } from '@libs/entities-lib/base';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { GlobalHandler, IRestResponse } from '../http-client';

export interface IDomainBaseService<T, IdParams> {
  get(idParams: IdParams, useGlobalHandler?: GlobalHandler): Promise<T>;
  getFullResponse(idParams: IdParams, useGlobalHandler?: GlobalHandler): Promise<IRestResponse<T>>;
  getAll(parentId?: Omit<IdParams, 'id'>): Promise<T[]>;
  getAllIncludingInactive(parentId?: Omit<IdParams, 'id'>): Promise<T[]>;
  getByIds(ids: uuid[], route?: string): Promise<T[]>;
  activate(idParams: IdParams): Promise<T>;
  deactivate(idParams: IdParams): Promise<T>;
  search(params: IAzureSearchParams, searchEndpoint?: string): Promise<IAzureCombinedSearchResult<T, unknown>>;
}

export interface IDomainBaseServiceMock <T extends IEntity> {
  get: jest.Mock<T>;
  getFullResponse: jest.Mock<IRestResponse<T>>;
  getAll: jest.Mock<Array<T>>;
  getAllIncludingInactive: jest.Mock<Array<T>>;
  getByIds: jest.Mock<Array<T>>;
  activate: jest.Mock<T>;
  deactivate: jest.Mock<T>;
  search: jest.Mock<IAzureCombinedSearchResult<T, unknown>>;
}
