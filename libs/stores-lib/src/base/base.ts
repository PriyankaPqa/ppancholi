import _cloneDeep from 'lodash/cloneDeep';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { IEntity, Status } from '@libs/entities-lib/base';
import { ICrcWindowObject } from '@libs/entities-lib/ICrcWindowObject';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { DomainBaseService, IDomainBaseServiceMock } from '@libs/services-lib/base';
import Vue, {
  ref, Ref,
} from 'vue';

import { BaseEntityStoreComponents, BaseStoreComponents } from './base.types';

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

  function getById(id: uuid) {
    return _cloneDeep(items.value.find((e) => e.id === id) || {});
  }
  function getByCriteria(query: string, searchAll: boolean, searchAmong: string[]) {
    return sharedHelpers.filterCollectionByValue(items.value, query, searchAll, searchAmong);
  }

  function getByIds(ids: uuid[], onlyActive?: boolean) {
    if (onlyActive) {
      return ids.map((id) => _cloneDeep(items.value.find((e) => e.id === id && e.status === Status.Active)) || {});
    }
    return ids.map((id) => _cloneDeep(items.value.find((e) => e.id === id)) || {});
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

  async function fetch(idParams: IdParams, useGlobalHandler = true): Promise<T> {
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
    set,
    setAll,
    fetch,
    fetchAll,
    fetchAllIncludingInactive,
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

  async function search({ params, searchEndpoint }: { params: IAzureSearchParams, searchEndpoint?: string }): Promise<IAzureCombinedSearchResult<T, unknown>> {
    const res = await service.search(params, searchEndpoint);
    return res;
  }

  function setSearchLoading(payload: boolean) {
    searchLoading.value = payload;
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
    setSearchLoading,
    setItemFromOutsideNotification,
  } as BaseEntityStoreComponents<T, IdParams>;
}
