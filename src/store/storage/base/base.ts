import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import { IEntity, IEntityCombined, Status } from '@/entities/base';
import { IStore, IState } from '@/store';
import { IAzureSearchParams } from '@/types';
import { IAzureTableSearchResults, ICombinedIndex } from '@/types/interfaces/IAzureSearchResult';
import { IBaseStorage } from './base.types';

export class Base<TEntity extends IEntity, TMetadata extends IEntity, IdParams> implements IBaseStorage<TEntity, TMetadata, IdParams> {
  protected readonly entityModuleName;

  protected readonly metadataModuleName;

  protected store;

  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    this.store = pStore;
    this.metadataModuleName = pMetadataModuleName;
    this.entityModuleName = pEntityModuleName;
  }

  protected combinedCollections(entities: Array<TEntity>, metadata: Array<TMetadata>): Array<IEntityCombined<TEntity, TMetadata>> {
    if (!Array.isArray(entities)) {
      return [];
    }
    return entities.filter((e) => !_isEmpty(e)).map((e) => {
      const match = metadata && metadata.find((m) => m && m.id === e.id);
      return {
        entity: e,
        metadata: match || {},
      } as IEntityCombined<TEntity, TMetadata>;
    });
  }

  protected metadataActionExists(actionName: string): boolean {
    // eslint-disable-next-line
    return Object.keys(this.store._actions).includes(`${this.metadataModuleName}/${actionName}`);
  }

  protected baseGetters = {
    getAll: (): Array<IEntityCombined<TEntity, TMetadata>> => {
      const entities = this.store.getters[`${this.entityModuleName}/getAll`];
      const metadata = this.store.getters[`${this.metadataModuleName}/getAll`];

      return this.combinedCollections(entities, metadata);
    },

    get: (id: uuid): IEntityCombined<TEntity, TMetadata> => {
      const entity = this.store.getters[`${this.entityModuleName}/get`](id);
      const metadata = this.store.getters[`${this.metadataModuleName}/get`](id);
      return {
        entity,
        metadata,
      };
    },

    getByCriteria: (query: string, searchAll: boolean, searchAmong: Array<string>) => {
      // We get results from entities and metadata
      const entities = this.store.getters[`${this.entityModuleName}/getByCriteria`](query, searchAll, searchAmong) as Array<TEntity>;
      const metadata = this.store.getters[`${this.metadataModuleName}/getByCriteria`](query, searchAll, searchAmong) as Array<TMetadata>;

      const entityIds = entities.map((h) => h.id);
      const metadataIds = metadata.map((m) => m.id);

      const matchingIds = entityIds.concat(metadataIds);

      const foundEntities = this.store.getters[`${this.entityModuleName}/getAll`].filter((e: TEntity) => matchingIds.indexOf(e.id) >= 0);

      const foundMetadata = this.store.getters[`${this.metadataModuleName}/getAll`].filter((e: TMetadata) => matchingIds.indexOf(e.id) >= 0);

      return this.combinedCollections(foundEntities, foundMetadata);
    },

    getByIds: (ids: uuid[], onlyActive = false) => {
      const entities = this.store.getters[`${this.entityModuleName}/getByIds`](ids, onlyActive);
      const metadata = this.store.getters[`${this.metadataModuleName}/getByIds`](ids, onlyActive);

      return this.combinedCollections(entities, metadata);
    },
  }

  protected baseActions = {
    fetch: async (idParams: IdParams,
      { useEntityGlobalHandler, useMetadataGlobalHandler } = { useEntityGlobalHandler: true, useMetadataGlobalHandler: true })
      : Promise<IEntityCombined<TEntity, TMetadata>> => {
      const entity = await this.store.dispatch(`${this.entityModuleName}/fetch`, { idParams, useGlobalHandler: useEntityGlobalHandler });

      let metadata = null;
      // Metadata do not exist for option items (financial categories, document categories etc.)

      if (this.metadataActionExists('fetch')) {
        metadata = await this.store.dispatch(`${this.metadataModuleName}/fetch`, { idParams, useGlobalHandler: useMetadataGlobalHandler });
      }

      return {
        entity,
        metadata,
      };
    },

    fetchAll: async (parentId?: Omit<IdParams, 'id'>): Promise<IEntityCombined<TEntity, TMetadata>[]> => {
      const entities = await this.store.dispatch(`${this.entityModuleName}/fetchAll`, parentId);
      let metadata = [];
      // Metadata do not exist for option items (financial categories, document categoris etc.)

      if (this.metadataActionExists('fetchAll')) {
        metadata = await this.store.dispatch(`${this.metadataModuleName}/fetchAll`, parentId);
      }

      return this.combinedCollections(entities, metadata);
    },

    fetchAllIncludingInactive: async (): Promise<IEntityCombined<TEntity, TMetadata>[]> => {
      const entities = await this.store.dispatch(`${this.entityModuleName}/fetchAllIncludingInactive`);
      let metadata = [];
      // Metadata do not exist for option items (financial categories, document categoris etc.)

      if (this.metadataActionExists('fetchAllIncludingInactive')) {
        metadata = await this.store.dispatch(`${this.metadataModuleName}/fetchAllIncludingInactive`);
      }

      return this.combinedCollections(entities, metadata);
    },

    deactivate: async (idParams: IdParams): Promise<TEntity> => {
      const returned = await this.store.dispatch(`${this.entityModuleName}/deactivate`, idParams) as TEntity;
      // If entity is inactive, deactivate Metadata
      if (returned && returned.status === Status.Inactive) {
        const metadata = _cloneDeep(await this.store.getters[`${this.metadataModuleName}/get`](returned.id));
        metadata.status = Status.Inactive;
        this.store.commit(`${this.metadataModuleName}/set`, metadata);
      }
      return returned;
    },

    activate: (idParams: IdParams): Promise<TEntity> => this.store.dispatch(`${this.entityModuleName}/activate`, idParams),

    search: async (params: IAzureSearchParams, searchEndpoint: string = null, includeInactiveItems?: boolean): Promise<IAzureTableSearchResults> => {
      this.store.commit(`${this.entityModuleName}/setSearchLoading`, true);
      const newParams = { ...params };
      if (includeInactiveItems !== true) {
        newParams.filter = newParams.filter || {};
        newParams.filter = {
          ...(typeof (newParams.filter) === 'string' ? { filter: newParams.filter } : newParams.filter),
          'Entity/Status': Status.Active,
        };
      }
      const res = await this.store.dispatch(`${this.entityModuleName}/search`, { params: newParams, searchEndpoint });

      const data = res?.value;
      if (data) {
        const ids = data.filter((e: ICombinedIndex<TEntity, TMetadata>) => e.entity?.id)
          .map((res: ICombinedIndex<TEntity, TMetadata>) => {
            const entity = { ...res.entity, eTag: res.entityETag };
            const metadata = { ...res.metadata, eTag: res.metadataETag };
            this.store.commit(`${this.entityModuleName}/set`, entity);
            this.store.commit(`${this.metadataModuleName}/set`, metadata);
            return entity.id;
          });

        this.store.commit(`${this.entityModuleName}/setSearchLoading`, false);
        return { ids, count: res.odataCount };
      }

      return { ids: [], count: 0 };
    },
  }

  protected baseMutations = {
    setEntity: (entity: TEntity) => {
      this.store.commit(`${this.entityModuleName}/set`, entity);
    },

    setAllEntities: (payload:TEntity[]) => {
      this.store.commit(`${this.entityModuleName}/setAll`, payload);
    },

    setMetadata: (metadata: TMetadata) => {
      this.store.commit(`${this.metadataModuleName}/set`, metadata);
    },

    setAllMetadata: (payload:TMetadata[]) => {
      this.store.commit(`${this.metadataModuleName}/setAll`, payload);
    },
  }

  public make = () => ({
    getters: this.baseGetters,
    actions: this.baseActions,
    mutations: this.baseMutations,
  })
}
