import { IEntity } from '@libs/entities-lib/base';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { IRestResponse } from '../http-client';

export interface IDomainBaseService<T extends IEntity, IdParams> {
  get(idParams: IdParams, useGlobalHandler?: boolean): Promise<T>;
  getFullResponse(idParams: IdParams, useGlobalHandler?: boolean): Promise<IRestResponse<T>>;
  getAll(parentId?: Omit<IdParams, 'id'>): Promise<T[]>;
  getAllIncludingInactive(parentId?: Omit<IdParams, 'id'>): Promise<T[]>;
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
