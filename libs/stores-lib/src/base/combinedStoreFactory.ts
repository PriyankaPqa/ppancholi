import helpers from '@libs/entities-lib/helpers';
import { IEntity, IEntityCombined, Status } from '@libs/entities-lib/base';
import _isEmpty from 'lodash/isEmpty';
import {
 IAzureSearchParams, IAzureTableSearchResults, ICombinedIndex, IRestResponse,
} from '@libs/shared-lib/types';
import { IFullResponseCombined } from '@libs/services-lib/http-client';

export class CombinedStoreFactory<TEntity extends IEntity, TMetadata extends IEntity, IdParams> {
  private storeEntity;

  private readonly storeMetadata;

  constructor(pStoreEntity: any, pStoreMetadata: any) {
    this.storeEntity = pStoreEntity;
    this.storeMetadata = pStoreMetadata;
  }

  private combinedCollections(entities: Array<TEntity>, metadata: Array<TMetadata>, pinnedIds: Array<string> = []): Array<IEntityCombined<TEntity, TMetadata>> {
    if (!Array.isArray(entities)) {
      return [];
    }

    return entities.filter((e) => !_isEmpty(e))
      .map((e) => {
        const match = metadata && metadata.find((m) => m && m.id === e.id);
        return {
          entity: e,
          metadata: match || {},
          // for newly created entities we pass the pinnedIds array, so they can be highlighted
          pinned: pinnedIds.indexOf(e.id) > -1,
        } as IEntityCombined<TEntity, TMetadata>;
      });
  }

  getNewlyCreatedIds(maxDate?: Date): Array<{ id: uuid, createdOn: number }> {
    return this.storeEntity.getNewlyCreatedIds(maxDate);
  }

  getByIds(ids: uuid[], options?: { onlyActive?: boolean, prependPinnedItems?: boolean, baseDate?: Date, parentId?: Record<string, unknown> }) {
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
      onlyActive: false,
      prependPinnedItems: false,
      baseDate: new Date(),
...(options || {}),
    };
    let pinnedIds = opts.prependPinnedItems ? this.getNewlyCreatedIds(opts.baseDate)
      .map((x) => x.id) : [];

    if (pinnedIds.length && opts.parentId && typeof opts.parentId === 'object') {
      let newEntities: TEntity[] = this.storeEntity.getByIds(pinnedIds);
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

    const entities = this.storeEntity.getByIds(idsToFetch, opts.onlyActive);
    const metadata = this.storeMetadata ? this.storeMetadata.getByIds(idsToFetch, opts.onlyActive) : [];

    return this.combinedCollections(entities, metadata, pinnedIds);
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null, includeInactiveItems?: boolean): Promise<IAzureTableSearchResults> {
    this.storeEntity.setSearchLoading(true);
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

    const res = await this.storeEntity.search({
      params: newParams,
      searchEndpoint,
    });

    const data = res?.value;

    if (data) {
      const filteredData = data.filter((e: ICombinedIndex<TEntity, TMetadata>) => e.entity?.id);

      const ids = [] as string [];
      const entities = [] as TEntity[];
      const metadata = [] as TMetadata[];

      filteredData.forEach((r: ICombinedIndex<TEntity, TMetadata>) => {
        ids.push(r.entity.id);
        entities.push({ ...r.entity });
        metadata.push({ ...r.metadata });
      });

      this.storeEntity.setAll(entities);
      this.storeMetadata.setAll(metadata);

      this.storeEntity.setSearchLoading(false);

      return {
        ids,
        count: res.odataCount,
        date: new Date(),
      };
    }
    return null;
  }

  getAll(): IEntityCombined<TEntity, TMetadata>[] {
    const entities = this.storeEntity.getAll();
    const metadata = this.storeMetadata.getAll();
    return this.combinedCollections(entities, metadata);
  }

  getById(id: uuid): IEntityCombined<TEntity, TMetadata> {
    const entity = this.storeEntity.getById(id);
    const metadata = this.storeMetadata.getById(id);
    // case file store has overwritten combinedCollections to add properties
    // thus if you need more properties you can also override combinedCollections
    return this.combinedCollections([entity], [metadata])[0] || { entity, metadata };
  }

  getByCriteria(query: string, searchAll: boolean, searchAmong: Array<string>) {
    // We get results from entities and metadata
    const entities = this.storeEntity.getByCriteria(query, searchAll, searchAmong) as Array<TEntity>;
    const metadata = this.storeMetadata.getByCriteria(query, searchAll, searchAmong) as Array<TMetadata>;

    const entityIds = entities.map((h) => h.id);
    const metadataIds = metadata.map((m) => m.id);

    const matchingIds = entityIds.concat(metadataIds);

    const foundEntities = this.storeEntity.getAll().filter((e: TEntity) => matchingIds.indexOf(e.id) >= 0);

    const foundMetadata = this.storeMetadata.getAll().filter((e: TMetadata) => matchingIds.indexOf(e.id) >= 0);

    return this.combinedCollections(foundEntities, foundMetadata);
  }

  async fetch(idParams: IdParams, {
    useEntityGlobalHandler,
    useMetadataGlobalHandler,
  } = {
    useEntityGlobalHandler: true,
    useMetadataGlobalHandler: true,
  }): Promise<IEntityCombined<TEntity, TMetadata>> {
    const requests = [
      this.storeEntity.fetch(idParams, useEntityGlobalHandler),
      this.storeMetadata.fetch(idParams, useMetadataGlobalHandler),
    ];

    const results = await Promise.all(requests);
    const entity = results[0] as TEntity;
    const metadata = results[1] as TMetadata || null;

    return {
      entity,
      metadata,
    };
  }

  async fetchFullResponse(idParams: IdParams, {
    useEntityGlobalHandler,
    useMetadataGlobalHandler,
    returnEntityFullResponse,
    returnMetadataFullResponse,
  } = {
    useEntityGlobalHandler: true,
    useMetadataGlobalHandler: true,
    returnEntityFullResponse: true,
    returnMetadataFullResponse: true,
  }): Promise<IFullResponseCombined<TEntity, TMetadata>> {
    const requests = [
      this.storeEntity.fetch(idParams, useEntityGlobalHandler, returnEntityFullResponse),
      this.storeMetadata.fetch(idParams, useMetadataGlobalHandler, returnMetadataFullResponse),
    ];

    const results = await Promise.all(requests);
    const fullResponseEntity = results[0] as IRestResponse<TEntity>;
    const fullResponseMetadata = results[1] as IRestResponse<TMetadata> || null;

    return {
      entity: fullResponseEntity,
      metadata: fullResponseMetadata,
    };
  }

  async fetchAll(parentId?: Omit<IdParams, 'id'>): Promise<IEntityCombined<TEntity, TMetadata>[]> {
    const requests = [
      this.storeEntity.fetchAll(parentId),
      this.storeMetadata.fetchAll(parentId),
    ];

    const results = await Promise.all(requests);
    const entities = results[0] as TEntity[];
    const metadata = results[1] as TMetadata[] || [];

    return this.combinedCollections(entities, metadata);
  }

  async fetchAllIncludingInactive(parentId?: Omit<IdParams, 'id'>): Promise<IEntityCombined<TEntity, TMetadata>[]> {
    const requests = [
      this.storeEntity.fetchAllIncludingInactive(parentId),
      this.storeMetadata.fetchAllIncludingInactive(parentId),
    ];

    const results = await Promise.all(requests);
    const entities = results[0] as TEntity[];
    const metadata = results[1] as TMetadata[] || [];

    return this.combinedCollections(entities, metadata);
  }
}
