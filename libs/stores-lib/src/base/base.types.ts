import { Ref } from 'vue';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/base';

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
  getNewlyCreatedIds: (baseDate?: Date) => { id: uuid, createdOn: number }[],
}

export interface BaseActions <T extends IEntity, IdParams> {
  set: (item: T) => void
  setAll: (payload: Array<T>) => void
  fetch: (idParams: IdParams, useGlobalHandler?: boolean) => Promise<T>
  fetchAll: (parentId?: Omit<IdParams, 'id'>) => Promise<T[]>
  fetchAllIncludingInactive: (parentId?: Omit<IdParams, 'id'>) => Promise<T[]>
  fetchByIds: (ids: uuid[], fetchMissingOnly: boolean) => Promise<T[]>,
  addNewlyCreatedId: (item: T) => void,
  setItemFromOutsideNotification: () => void,

}
export interface BaseStoreComponents<T extends IEntity, IdParams> extends BaseState<T>, BaseGetters<T>, BaseActions<T, IdParams> {}

export interface BaseEntityStoreComponents<T extends IEntity, IdParams> extends BaseStoreComponents<T, IdParams> {
  searchLoading: Ref<boolean>
  setSearchLoading: (payload: boolean) => void
  deactivate: (idParams: IdParams) => Promise<T>
  activate: (idParams: IdParams) => Promise<T>
  search: ({ params, searchEndpoint }: { params: IAzureSearchParams, searchEndpoint?: string }) => Promise<IAzureCombinedSearchResult<T, unknown>>
}
