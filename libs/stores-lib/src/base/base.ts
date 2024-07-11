import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import _chunk from 'lodash/chunk';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { IEntity } from '@libs/entities-lib/base';
import { ICrcWindowObject } from '@libs/entities-lib/ICrcWindowObject';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { ICombinedSearchResult, ISearchParams, ITableSearchResults, ICombinedIndex, Status } from '@libs/shared-lib/types';
import { DomainBaseService, IDomainBaseServiceMock } from '@libs/services-lib/base';
import helpers from '@libs/entities-lib/helpers';

import Vue, {
  ref, Ref,
} from 'vue';

import { GlobalHandler } from '@libs/services-lib/http-client';
import { BaseEntityStoreComponents, BaseStoreComponents } from './base.types';

// eslint-disable-next-line max-lines-per-function
export function getBaseStoreComponents<T extends IEntity, IdParams>(
  service: DomainBaseService<T, IdParams> | IDomainBaseServiceMock<T>,
) {
  // State
  const items = ref([]) as Ref<T[]>;
  const newlyCreatedIds = ref([]);
  const maxTimeInSecondsForNewlyCreatedIds = ref(60);

  function getNewlyCreatedIds(baseDate?: Date) {
    const maxTime = (baseDate || new Date()).getTime() - maxTimeInSecondsForNewlyCreatedIds.value * 1000;
    return _cloneDeep(newlyCreatedIds.value.filter((i) => i.createdOn > maxTime));
  }

  function getById(id: uuid): T {
    return _cloneDeep(items.value.find((e) => e.id === id) || {} as T);
  }
  function getByCriteria(query: string, searchAll: boolean, searchAmong: string[]) {
    return sharedHelpers.filterCollectionByValue(items.value, query, searchAll, searchAmong);
  }

  function getByIds(ids: uuid[], onlyActive?: boolean): T[] {
    if (!ids?.length) {
      return [];
    }
    if (onlyActive) {
      // metadata doesnt always have status
      return ids.map((id) => _cloneDeep(items.value.find((e) => e.id === id && (e.status === Status.Active || e.status == null))) || {} as T);
    }

    return ids.map((id) => _cloneDeep(items.value.find((e) => e.id === id)) || {} as T);
  }

  function getByIdsWithPinnedItems(ids: uuid[], options?: { onlyActive?: boolean, baseDate?: Date, parentId?: Record<string, unknown> }):
  Array<T> {
    /* jira-2482
        baseDate is used to filter within the list of objects created by the user recently.
        The goal is to use them in lists after a search so that the new items show at the top of the list
        we use baseDate as the static moment the list was first populated (last search that occured). Thus
        the filter on the date of creation of the item keeps returning the same data until a new search is applied
        — else signalr sends messages and getByIds always gets recomputed. If the date was always new Date(), items
        would simply start disappearing because of actions outside of the current user's reach — someone else saving a case file
        would trigger getByIdsWithPinnedItems, with the same 10 search results as before, and because it has been more than one minute pinned items
        would disappear from the list (a new search would have returned them by now, but no search was triggered!)

        parentId is also added so we can filter within pinnedItems - so that for subitems under a case file for example only
        newly created for that case file are visible
      */
    const opts = {
      onlyActive: false,
      baseDate: new Date(),
...(options || {}),
    };
    let pinnedIds = getNewlyCreatedIds(opts.baseDate).map((x) => x.id);

      if (pinnedIds.length && opts.parentId && typeof opts.parentId === 'object') {
        let newEntities = getByIds(pinnedIds);
        // eslint-disable-next-line
        for (const [key, value] of Object.entries(opts.parentId)) {
          if (Array.isArray(value)) { // For a case where we want to include several values of a same property. Ex: parentId: {type: ['A', 'B']}
            // eslint-disable-next-line
            newEntities = newEntities.filter((e: any) => value.includes(helpers.getValueByPath(e, key)));
          } else {
            // eslint-disable-next-line
            newEntities = newEntities.filter((e: any) => helpers.getValueByPath(e, key) === value);
          }
        }
        pinnedIds = newEntities.map((e) => e.id);
      }

      const idsExceptPinned = ids.filter((s) => pinnedIds.indexOf(s) < 0);
      const idsToFetch = [...pinnedIds, ...idsExceptPinned];

      const entities = getByIds(idsToFetch, opts.onlyActive).filter((e) => !_isEmpty(e));

    return entities.map((e) => ({ ...e, pinned: pinnedIds.indexOf(e.id) > -1 }));
  }

  function getAll() {
    return _cloneDeep(items.value);
  }

  // Actions
  function upsert(item: T) {
    if (!item) {
      return;
    }
    const index = items.value.findIndex((x) => x?.id === item.id);
    const stateItem = items.value[index];

    if (stateItem == null) {
      items.value.push(item);
    } else if (stateItem.timestamp < item.timestamp) {
      Vue.set(items.value, index, item);
    }

    const w: ICrcWindowObject = window;
    w.crcSingletons?.signalR?.addSubscription(item.id);
  }

  function set(item: T) {
    upsert(item);
  }

  function setAll(payload: Array<T>) {
    payload.forEach((item) => upsert(item));
  }

  async function fetch(idParams: IdParams, useGlobalHandler = GlobalHandler.Enabled): Promise<T> {
    try {
      const res = await service.get(idParams, useGlobalHandler);
      if (res) {
        set(res);
      }

      return res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const error = e.response?.data?.errors;
      // normal errors already logged in service.get
      // when e is an array returned from BE (a validation error or 404)
      if (error && !Array.isArray(error)) {
        applicationInsights.trackException(error, { idParams }, 'module.base', 'fetch');
      }
      return null;
    }
  }

  async function fetchAll(parentId?: Omit<IdParams, 'id'>): Promise<T[]> {
    try {
      const res = await service.getAll(parentId);
      if (res) {
        setAll(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { parentId }, 'module.base', 'fetchAll');
      return null;
    }
  }

  async function fetchAllIncludingInactive(parentId?: Omit<IdParams, 'id'>): Promise<T[]> {
    try {
      const res = await service.getAllIncludingInactive(parentId);
      setAll(res);
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.base', 'fetch');
      return null;
    }
  }

  async function fetchByIds(ids: uuid[], fetchMissingOnly: boolean = false, batchSize = 40): Promise<T[]> {
    // default batch size should keep the query string under 2,083 characters (max length for Edge)
    if (!ids?.length) {
      return [];
    }
    let idsToGet = ids.filter((x) => x != null);
    try {
      if (fetchMissingOnly) {
        const stored = getByIds(ids) as IEntity[];
        idsToGet = idsToGet.filter((id) => !stored.find((s) => s.id === id));
      }

      if (idsToGet.length === 0) {
        return getByIds(ids);
      }

      const idBatches = _chunk(idsToGet, batchSize);
      let res = [] as T[];
      await Promise.all(idBatches.map(async (batch) => {
        const batchRes = await service.getByIds(batch);
        if (batchRes) {
          res = [...res, ...batchRes];
        }
      }));

      setAll(res);
      return getByIds(ids);
    } catch (e) {
      applicationInsights.trackException(e, { }, 'module.base', 'fetchByIds');
      return null;
    }
  }

  function addNewlyCreatedId(item: T) {
    if (!newlyCreatedIds.value.find((n) => n.id === item.id)) {
      newlyCreatedIds.value.unshift({ id: item.id, createdOn: (new Date()).getTime() });
    }
  }

  function setItemFromOutsideNotification(item: T, initiatedByCurrentUser: boolean) {
    if (!item?.id) {
      return;
    }
    const knownItem = getById(item.id) as T;
    if (initiatedByCurrentUser || knownItem?.id) {
     set(item);
      // console.log(`Metadata - ${knownItem.lastAction}`, knownItem.id);
    } else {
      // console.log('Metadata - ignored', knownItem.id);
    }
  }

  return {
    items,
    newlyCreatedIds,
    maxTimeInSecondsForNewlyCreatedIds,
    getNewlyCreatedIds,
    getAll,
    getById,
    getByCriteria,
    getByIds,
    getByIdsWithPinnedItems,
    set,
    setAll,
    fetch,
    fetchAll,
    fetchAllIncludingInactive,
    fetchByIds,
    addNewlyCreatedId,
    setItemFromOutsideNotification,
  } as BaseStoreComponents<T, IdParams>;
}

export function getEntityStoreComponents<T extends IEntity, IdParams>(
  service: DomainBaseService<T, IdParams>,
) {
  const readOnlyComponents = getBaseStoreComponents(service);
  const searchLoading = ref(false);
  async function deactivate(idParams: IdParams): Promise<T> {
    try {
      const res = await service.deactivate(idParams);
      readOnlyComponents.set(res);
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { idParams }, 'module.base', 'deactivate');
      return null;
    }
  }

  async function activate(idParams: IdParams): Promise<T> {
    try {
      const res = await service.activate(idParams);
      readOnlyComponents.set(res);
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { idParams }, 'module.base', 'activate');
      return null;
    }
  }

  async function combinedSearch({ params, searchEndpoint }: { params: ISearchParams, searchEndpoint?: string }): Promise<ICombinedSearchResult<T, unknown>> {
    const res = await service.search(params, searchEndpoint);
    return res;
  }

  function setSearchLoading(payload: boolean) {
    searchLoading.value = payload;
  }

  async function search({ params, searchEndpoint, includeInactiveItems = false, otherSearchEndpointParameters = {} }:
    { params: ISearchParams, searchEndpoint?: string, includeInactiveItems?: boolean, otherSearchEndpointParameters?: any })
    : Promise<ITableSearchResults<T>> {
      setSearchLoading(true);
      let newParams = { ...params, ...otherSearchEndpointParameters };

      if (includeInactiveItems !== true) {
        newParams = sharedHelpers.removeInactiveItemsFilterOdata(newParams);
      }

    const res = await service.search(newParams, searchEndpoint);

    const data = res?.value as ICombinedIndex<T, null>[];

    if (data) {
      const filteredData = data.filter((e) => e.entity?.id);

      const ids = [] as string [];
      const entities = [] as T[];

      filteredData.forEach((r) => {
        ids.push(r.entity.id);
        entities.push({ ...r.entity });
      });

      readOnlyComponents.setAll(entities);

      setSearchLoading(false);

      return {
        ids,
        count: res.odataCount,
        date: new Date(),
        values: entities,
      };
    }
    return null;
  }

  // In "entity" store the behavior of setItemFromOutsideNotification is different from basic store. Hence, we override this metthod
  function setItemFromOutsideNotification(entity: T, initiatedByCurrentUser: boolean) {
    if (!entity?.id) {
      return;
    }
    const knownEntity = readOnlyComponents.getById(entity.id);
    if (initiatedByCurrentUser || knownEntity?.id) {
      if (entity.lastAction === 'Created' && initiatedByCurrentUser) {
        readOnlyComponents.addNewlyCreatedId(entity);
      }
      readOnlyComponents.set(entity);
      // console.log(`Entity - ${entity.lastAction}`, entity.id);
    } else {
      // console.log('Entity - ignored', entity.id);
    }
  }

  return {
    ...readOnlyComponents,
    searchLoading,
    deactivate,
    activate,
    search,
    combinedSearch,
    setSearchLoading,
    setItemFromOutsideNotification,
  } as BaseEntityStoreComponents<T, IdParams>;
}
