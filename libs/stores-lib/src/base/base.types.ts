import { Ref } from 'vue';
import { ICombinedSearchResult, ISearchParams, ITableSearchResults } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/base';
import { GlobalHandler } from '@libs/services-lib/http-client';

export interface BaseState<T extends IEntity> {
  items: Ref<Array<T>>
  newlyCreatedIds: Ref<Array<{ id: uuid, createdOn: number }>>
  maxTimeInSecondsForNewlyCreatedIds: Ref<number>,
}

export interface BaseGetters <T extends IEntity> {
  getAll: () => T[]
  getById: (id: uuid) => T
  getByCriteria: (query: string, searchAll: boolean, searchAmong: string[]) => T[]
  getByIds: (ids: uuid[], onlyActive?: boolean) => T[]
  getByIdsWithPinnedItems
  : (ids: uuid[], options?: { onlyActive?: boolean, baseDate?: Date, parentId?: Record<string, unknown> }) => T[]
  getNewlyCreatedIds: (baseDate?: Date) => { id: uuid, createdOn: number }[],
}

export interface BaseActions <T extends IEntity, IdParams> {
  set: (item: T) => void
  setAll: (payload: Array<T>) => void
  fetch: (idParams: IdParams, useGlobalHandler?: GlobalHandler) => Promise<T>
  fetchAll: (parentId?: Omit<IdParams, 'id'>) => Promise<T[]>
  fetchAllIncludingInactive: (parentId?: Omit<IdParams, 'id'>) => Promise<T[]>
  fetchByIds: (ids: uuid[], fetchMissingOnly: boolean, batchSize?: number) => Promise<T[]>,
  addNewlyCreatedId: (item: T) => void,
  setItemFromOutsideNotification: (entity: T, initiatedByCurrentUser: boolean) => void,

}
export interface BaseStoreComponents<T extends IEntity, IdParams> extends BaseState<T>, BaseGetters<T>, BaseActions<T, IdParams> {}

export interface BaseEntityStoreComponents<T extends IEntity, IdParams> extends BaseStoreComponents<T, IdParams> {
  searchLoading: Ref<boolean>
  setSearchLoading: (payload: boolean) => void
  deactivate: (idParams: IdParams) => Promise<T>
  activate: (idParams: IdParams) => Promise<T>
  combinedSearch: ({ params, searchEndpoint }: { params: ISearchParams, searchEndpoint?: string }) => Promise<ICombinedSearchResult<T, unknown>>
  search: ({ params, searchEndpoint, includeInactiveItems, otherSearchEndpointParameters }:
    { params: ISearchParams, searchEndpoint?: string, includeInactiveItems?: boolean, otherSearchEndpointParameters?: any }) => Promise<ITableSearchResults<T>>
}
