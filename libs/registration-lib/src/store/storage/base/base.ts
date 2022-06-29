/* eslint-disable no-lonely-if */
/* eslint-disable no-console */
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import { IAzureSearchParams, IAzureTableSearchResults, ICombinedIndex } from '@libs/core-lib/types';
import { IEntity, IEntityCombined, Status } from '@libs/core-lib/entities/base';
import { IStore, IState } from '../..';
import { IBaseStorage } from './base.types';

export class Base<TEntity extends IEntity, TMetadata extends IEntity, IdParams> implements IBaseStorage<TEntity, TMetadata, IdParams> {
  protected readonly entityModuleName;

  protected readonly metadataModuleName;

  protected store;

  protected showConsole = false;

  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    this.store = pStore;
    this.metadataModuleName = pMetadataModuleName;
    this.entityModuleName = pEntityModuleName;
  }

  protected combinedCollections(entities: Array<TEntity>,
    metadata: Array<TMetadata>, pinnedIds: Array<string> = []): Array<IEntityCombined<TEntity, TMetadata>> {
    if (!Array.isArray(entities)) {
      return [];
    }
    return entities.filter((e) => !_isEmpty(e)).map((e) => {
      const match = metadata && metadata.find((m) => m && m.id === e.id);
      return {
        entity: e,
        metadata: match || {},
        // for newly created entities we pass the pinnedIds array so they can be highlighted
        pinned: pinnedIds.indexOf(e.id) > -1,
      } as IEntityCombined<TEntity, TMetadata>;
    });
  }

  protected userId() {
    return this.store.getters['user/userId'];
  }

  protected initiatedByCurrentUser(entity: IEntity) {
    return this.userId() === entity.lastUpdatedBy || this.userId() === entity.createdBy;
  }

  protected baseGetters = {
    getAll: (): Array<IEntityCombined<TEntity, TMetadata>> => {
      const entities = this.store.getters[`${this.entityModuleName}/getAll`];
      const metadata = this.metadataModuleName ? this.store.getters[`${this.metadataModuleName}/getAll`] : null;

      return this.combinedCollections(entities, metadata);
    },

    // eslint-disable-next-line arrow-body-style
    getNewlyCreatedIds: (maxDate?: Date): Array<{id: uuid; createdOn: number}> => {
      return this.store.getters[`${this.entityModuleName}/getNewlyCreatedIds`](maxDate);
    },

    get: (id: uuid): IEntityCombined<TEntity, TMetadata> => {
      const entity = this.store.getters[`${this.entityModuleName}/get`](id);
      const metadata = this.metadataModuleName ? this.store.getters[`${this.metadataModuleName}/get`](id) : null;
      // case file store has overwritten combinedCollections to add properties
      // thus if you need more properties you can also override combinedCollections
      return this.combinedCollections([entity], [metadata])[0] || { entity, metadata };
    },

    getByCriteria: (query: string, searchAll: boolean, searchAmong: Array<string>) => {
      // We get results from entities and metadata
      const entities = this.store.getters[`${this.entityModuleName}/getByCriteria`](query, searchAll, searchAmong) as Array<TEntity>;
      const metadata = this.metadataModuleName
        ? this.store.getters[`${this.metadataModuleName}/getByCriteria`](query, searchAll, searchAmong) as Array<TMetadata> : [];

      const entityIds = entities.map((h) => h.id);
      const metadataIds = metadata.map((m) => m.id);

      const matchingIds = entityIds.concat(metadataIds);

      const foundEntities = this.store.getters[`${this.entityModuleName}/getAll`].filter((e: TEntity) => matchingIds.indexOf(e.id) >= 0);

      const foundMetadata = this.metadataModuleName
        ? this.store.getters[`${this.metadataModuleName}/getAll`].filter((e: TMetadata) => matchingIds.indexOf(e.id) >= 0) : [];

      return this.combinedCollections(foundEntities, foundMetadata);
    },

    getByIds: (ids: uuid[], options?: { onlyActive?: boolean; prependPinnedItems?: boolean; baseDate?: Date;
      parentId?: Record<string, unknown>; }) => {
      /* jira-2482
        prependPinnedItems and baseDate are used to filter within the list of objects created by the user recently.
        The goal is to use them in lists after a search so that the new items show at the top of the list
        we use baseDate as the static moment the list was first populated (last search that occured). Thus
        the filter on the date of creation of the item keeps returning the same data until a new search is applied
        — else signalr sends messages and getByIds always gets recomputed. If the date was always new Date(), items
        would simply start disappearing because of actions outside of the current user's reach — someone else saving a case file
        would trigger getByIds, with the same 10 search results as before, and because it has been more than one minute pinned items
        would disappear from the list (a new search would have returned them by now, but no search was triggered!)

        parentId is also added so we can filter within pinnedItems - so that for subitems under a case file for example only
        newly created for that case file are visible
      */
      const opts = {
        onlyActive: false, prependPinnedItems: false, baseDate: new Date(), ...(options || {}),
      };
      let pinnedIds = opts.prependPinnedItems ? this.baseGetters.getNewlyCreatedIds(opts.baseDate).map((x) => x.id) : [];
      if (pinnedIds.length && opts.parentId && typeof opts.parentId === 'object') {
        let newEntities: TEntity[] = this.store.getters[`${this.entityModuleName}/getByIds`](pinnedIds);
        // eslint-disable-next-line
        for (const [key, value] of Object.entries(opts.parentId)) {
          // eslint-disable-next-line
          newEntities = newEntities.filter((e: any) => e[key] === value);
        }
        pinnedIds = newEntities.map((e) => e.id);
      }
      const idsExceptPinned = ids.filter((s) => pinnedIds.indexOf(s) < 0);
      const idsToFetch = [...pinnedIds, ...idsExceptPinned];

      const entities = this.store.getters[`${this.entityModuleName}/getByIds`](idsToFetch, opts.onlyActive);
      const metadata = this.metadataModuleName ? this.store.getters[`${this.metadataModuleName}/getByIds`](idsToFetch, opts.onlyActive) : [];

      return this.combinedCollections(entities, metadata, pinnedIds);
    },
  }

  protected baseActions = {
    fetch: async (idParams: IdParams,
      { useEntityGlobalHandler, useMetadataGlobalHandler }
      = { useEntityGlobalHandler: true, useMetadataGlobalHandler: true }): Promise<IEntityCombined<TEntity, TMetadata>> => {
      const requests = [this.store.dispatch(`${this.entityModuleName}/fetch`, { idParams, useGlobalHandler: useEntityGlobalHandler })];

      if (this.metadataModuleName) {
        requests.push(this.store.dispatch(`${this.metadataModuleName}/fetch`, { idParams, useGlobalHandler: useMetadataGlobalHandler }));
      }
      const results = await Promise.all(requests);
      const entity = results[0];
      const metadata = results[1] || null;

      return {
        entity,
        metadata,
      };
    },

    fetchAll: async (parentId?: Omit<IdParams, 'id'>): Promise<IEntityCombined<TEntity, TMetadata>[]> => {
      const requests = [this.store.dispatch(`${this.entityModuleName}/fetchAll`, parentId)];

      if (this.metadataModuleName) {
        requests.push(this.store.dispatch(`${this.metadataModuleName}/fetchAll`, parentId));
      }
      const results = await Promise.all(requests);
      const entities = results[0];
      const metadata = results[1] || [];

      return this.combinedCollections(entities, metadata);
    },

    fetchAllIncludingInactive: async (): Promise<IEntityCombined<TEntity, TMetadata>[]> => {
      const requests = [this.store.dispatch(`${this.entityModuleName}/fetchAllIncludingInactive`)];

      if (this.metadataModuleName) {
        requests.push(this.store.dispatch(`${this.metadataModuleName}/fetchAllIncludingInactive`));
      }
      const results = await Promise.all(requests);
      const entities = results[0];
      const metadata = results[1] || [];

      return this.combinedCollections(entities, metadata);
    },

    deactivate: async (idParams: IdParams): Promise<TEntity> => {
      const returned = await this.store.dispatch(`${this.entityModuleName}/deactivate`, idParams) as TEntity;
      // If entity is inactive, deactivate Metadata
      if (returned && returned.status === Status.Inactive) {
        if (this.metadataModuleName) {
          const metadata = _cloneDeep(await this.store.getters[`${this.metadataModuleName}/get`](returned.id));
          metadata.status = Status.Inactive;
          this.store.commit(`${this.metadataModuleName}/set`, metadata);
        }
      }
      return returned;
    },

    activate: (idParams: IdParams): Promise<TEntity> => this.store.dispatch(`${this.entityModuleName}/activate`, idParams),

    search: async (
      params: IAzureSearchParams,
      searchEndpoint: string = null,
      includeInactiveItems?: boolean,
    ): Promise<IAzureTableSearchResults> => {
      this.store.commit(`${this.entityModuleName}/setSearchLoading`, true);
      const newParams = { ...params };

      if (includeInactiveItems !== true) {
        newParams.filter = newParams.filter || {};
        if (typeof (newParams.filter) === 'string') {
          newParams.filter = `${newParams.filter} and Entity/Status eq 1`;
        } else {
          newParams.filter = {
            ...newParams.filter as Record<string, unknown>,
            'Entity/Status': Status.Active,
          };
        }
      }

      const res = await this.store.dispatch(`${this.entityModuleName}/search`, { params: newParams, searchEndpoint });

      const data = res?.value;

      if (data) {
        const filteredData = data.filter((e: ICombinedIndex<TEntity, TMetadata>) => e.entity?.id);

        const ids = [] as string [];
        const entities = [] as TEntity[];
        const metadata = [] as TMetadata[];

        filteredData.forEach((res: ICombinedIndex<TEntity, TMetadata>) => {
          ids.push(res.entity.id);
          entities.push({ ...res.entity });
          metadata.push({ ...res.metadata });
        });

        this.store.commit(`${this.entityModuleName}/setAll`, entities);
        this.store.commit(`${this.metadataModuleName}/setAll`, metadata);

        this.store.commit(`${this.entityModuleName}/setSearchLoading`, false);

        return { ids, count: res.odataCount, date: new Date() };
      }
      this.store.commit(`${this.entityModuleName}/setSearchLoading`, false);
      return { ids: [], count: 0, date: new Date() };
    },
  }

  protected baseMutations = {
    addNewlyCreatedId: (entity: TEntity) => {
      this.store.commit(`${this.entityModuleName}/addNewlyCreatedId`, entity);
    },

    setEntity: (entity: TEntity) => {
      this.store.commit(`${this.entityModuleName}/set`, entity);
    },

    /// call this from signalR - we will decide here whether this item is of interest
    /// and if so will upsert it in items
    setEntityFromOutsideNotification: (entity: TEntity) => {
      if (!entity?.id) {
        return;
      }
      const knownEntity = this.baseGetters.get(entity.id);
      if (this.initiatedByCurrentUser(entity) || knownEntity?.entity?.id || knownEntity?.metadata?.id) {
        if (entity.lastAction === 'Created' && this.initiatedByCurrentUser(entity)) {
          this.baseMutations.addNewlyCreatedId(entity);
        }
        this.baseMutations.setEntity(entity);
        if (this.showConsole) {
          console.log(`${this.entityModuleName} - ${entity.lastAction}`, entity.id);
        }
      } else {
        if (this.showConsole) {
          console.log(`${this.entityModuleName} - ignored`, entity.id);
        }
      }
    },

    setAllEntities: (payload: TEntity[]) => {
      this.store.commit(`${this.entityModuleName}/setAll`, payload);
    },

    setMetadata: (metadata: TMetadata) => {
      if (this.metadataModuleName) {
        this.store.commit(`${this.metadataModuleName}/set`, metadata);
      }
    },

    /// call this from signalR - we will decide here whether this item is of interest
    /// and if so will upsert it in items
    setMetadataFromOutsideNotification: (entity: TMetadata) => {
      if (!entity?.id || !this.metadataModuleName) {
        return;
      }
      const knownEntity = this.baseGetters.get(entity.id);
      if (this.initiatedByCurrentUser(entity) || knownEntity?.entity?.id || knownEntity?.metadata?.id) {
        this.baseMutations.setMetadata(entity);
        if (this.showConsole) {
          console.log(`${this.metadataModuleName} - ${entity.lastAction}`, entity.id);
        }
      } else {
        if (this.showConsole) {
          console.log(`${this.metadataModuleName} - ignored`, entity.id);
        }
      }
    },

    setAllMetadata: (payload: TMetadata[]) => {
      if (this.metadataModuleName) {
        this.store.commit(`${this.metadataModuleName}/setAll`, payload);
      }
    },

    reset: () => {
      this.store.commit(`${this.entityModuleName}/reset`);
      this.store.commit(`${this.metadataModuleName}/reset`);
    },
  }

  public make = () => ({
    getters: this.baseGetters,
    actions: this.baseActions,
    mutations: this.baseMutations,
  })
}
