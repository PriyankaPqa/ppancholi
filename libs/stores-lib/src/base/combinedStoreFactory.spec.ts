import { defineStore, setActivePinia } from 'pinia';

import { createTestingPinia } from '@pinia/testing';
import { IUserAccountMetadata, mockUserAccountEntities, mockUserAccountMetadatum } from '@libs/entities-lib/user-account';

import { IEntity } from '@libs/entities-lib/base';
import { GlobalHandler } from '@libs/services-lib/http-client';
import { CombinedStoreFactory } from './combinedStoreFactory';
import { BaseEntityStoreComponents, BaseStoreComponents } from './base.types';
import { getBaseStoreComponents, getEntityStoreComponents } from './base';

export interface Entity extends IEntity {}
export interface Metadata extends IUserAccountMetadata {}

const mockEntities = mockUserAccountEntities();
const mockMetadatum = mockUserAccountMetadatum();

let useBaseCombinedStore = null as any;

const entityStoreComponents = getEntityStoreComponents<Entity, string>(null);
const baseMetadataStoreComponents = getBaseStoreComponents<Metadata, string>(null);

const createTestStore = (
  entityStoreComponents: BaseEntityStoreComponents<Entity, string>,
  baseMetadataStoreComponents: BaseStoreComponents<Metadata, string>,
  stubActions = false,
) => {
    const useStoreEntity = defineStore('baseCombined-entities', () => ({
      ...entityStoreComponents,
    }));

    const useStoreMetadata = defineStore('baseCombined-metadata', () => ({
      ...baseMetadataStoreComponents,
    }));

  const pinia = createTestingPinia({
    initialState: {
      'baseCombined-entities': {
        items: mockEntities,
        newlyCreatedIds: [{ id: '1', createdOn: new Date('2021/01/10') }],
      },
      'baseCombined-metadata': {
        items: mockMetadatum,
      },
    },
    stubActions,
  });
  setActivePinia(pinia);
  return new CombinedStoreFactory(useStoreEntity(), useStoreMetadata());
};

describe('Base Combined Store', () => {
  beforeEach(() => {
    useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
  });

  describe('getNewlyCreatedIds', () => {
    it('should return newly created ids from entity store', () => {
      const date = new Date('2020/01/10');
      expect(useBaseCombinedStore.getNewlyCreatedIds(date)).toEqual([{ id: '1', createdOn: new Date('2021/01/10') }]);
    });
  });

  describe('getByIds', () => {
    it('should return a list of entities and metadata filtered by the ids', () => {
      const ids = [mockEntities[0].id];
      const expected = [{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: false }];
      expect(useBaseCombinedStore.getByIds(ids)).toEqual(expected);
    });

    it('returns newlycreated items pinned according to id', () => {
      const ids = [mockEntities[0].id];
      entityStoreComponents.getNewlyCreatedIds = jest.fn(() => [{ id: mockEntities[0].id, createdOn: 1 }]);
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      expect(useBaseCombinedStore.getByIds(ids, { prependPinnedItems: true }))
        .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: true }]);

      expect(useBaseCombinedStore.getByIds([], { prependPinnedItems: true }))
        .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: true }]);

      expect(useBaseCombinedStore.getByIds([], { prependPinnedItems: false }))
        .toEqual([]);

      entityStoreComponents.getNewlyCreatedIds = jest.fn(() => []);
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      expect(useBaseCombinedStore.getByIds(ids, { prependPinnedItems: true }))
        .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: false }]);
    });

    it('filters newlycreated items pinned according to parentId', () => {
      const ids: string[] = [];
      entityStoreComponents.getNewlyCreatedIds = jest.fn(() => [{ id: mockEntities[0].id, createdOn: 1 }]);
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      // here we'll fake that tenantId is a parent of mockEntities
      expect(useBaseCombinedStore.getByIds(ids, { prependPinnedItems: true, parentId: { tenantId: mockEntities[0].tenantId } }))
        .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: true }]);

      expect(useBaseCombinedStore.getByIds(ids, { prependPinnedItems: true, parentId: { tenantId: 'nope' } as any }))
        .toEqual([]);
    });

    it('filters newlycreated items pinned according to parentId when an array is passed', () => {
      const ids: string[] = [];
      entityStoreComponents.getNewlyCreatedIds = jest.fn(() => [{ id: mockEntities[0].id, createdOn: 1 }]);
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      const res = useBaseCombinedStore.getByIds(ids, { prependPinnedItems: true, parentId: { tenantId: [mockEntities[0].tenantId] } });
      expect(res).toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: true }]);
    });
  });

  describe('search', () => {
    it('should call action search with the payload', async () => {
      const params = { filter: { Foo: 'foo' } };
      entityStoreComponents.combinedSearch = jest.fn();
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      await useBaseCombinedStore.search(params, null, true);
      expect(entityStoreComponents.combinedSearch).toBeCalledWith({ params, searchEndpoint: null });
    });

    it('should filter out inactive by default or if specified', async () => {
      const params = { filter: { Foo: 'foo' } };
      entityStoreComponents.combinedSearch = jest.fn();
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      await useBaseCombinedStore.search(params, null, null);

      expect(entityStoreComponents.combinedSearch).toBeCalledWith({ params: { filter: { Foo: 'foo', 'Entity/Status': 'Active' } }, searchEndpoint: null });

      jest.clearAllMocks();

      await useBaseCombinedStore.search(params, null, false);

      expect(entityStoreComponents.combinedSearch).toBeCalledWith({ params: { filter: { Foo: 'foo', 'Entity/Status': 'Active' } }, searchEndpoint: null });

      jest.clearAllMocks();

      const paramsNoFilter = { filter: '' };

      await useBaseCombinedStore.search(paramsNoFilter, null, false);

      expect(entityStoreComponents.combinedSearch).toBeCalledWith({ params: { filter: { 'Entity/Status': 'Active' } }, searchEndpoint: null });
    });

    it('should filterout inactives by default or if specified and build the correct filter when the filter is a string', async () => {
      const params = { filter: 'filter string' };
      entityStoreComponents.combinedSearch = jest.fn();
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      await useBaseCombinedStore.search(params);

      expect(entityStoreComponents.combinedSearch).toBeCalledWith({ params: { filter: 'filter string and Entity/Status eq \'Active\'' }, searchEndpoint: null });

      await useBaseCombinedStore.search(params, null, null);

      expect(entityStoreComponents.combinedSearch).toBeCalledWith({ params: { filter: 'filter string and Entity/Status eq \'Active\'' }, searchEndpoint: null });
    });

    it('should call commit setAll for both entity and metadata', async () => {
      entityStoreComponents.setAll = jest.fn();
      baseMetadataStoreComponents.setAll = jest.fn();
      (entityStoreComponents.combinedSearch as any) = jest.fn(() => Promise.resolve(
        {
          odataContext: 'foo',
          odataCount: 1,
          value: [{
            entityETag: 'mock-Entity-Etag', metadataETag: 'mock-metadata-Etag', entity: mockEntities[0], metadata: mockMetadatum[0],
          }],
        },
      ));

      const params = { filter: { Foo: 'foo' } };
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      await useBaseCombinedStore.search(params);

      expect(entityStoreComponents.setAll).toBeCalledWith([{ ...mockEntities[0] }]);
      expect(baseMetadataStoreComponents.setAll).toBeCalledWith([{ ...mockMetadatum[0] }]);
    });

    it('should return a list of ids and the total count of items', async () => {
      (entityStoreComponents.combinedSearch as any) = jest.fn(() => Promise.resolve(
        {
          odataContext: 'foo',
          odataCount: 1,
          value: [{
            entityETag: 'mock-Entity-Etag', metadataETag: 'mock-metadata-Etag', entity: mockEntities[0], metadata: mockMetadatum[0],
          }],
        },
      ));

      const params = { filter: { Foo: 'foo' } };
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      const res = await useBaseCombinedStore.search(params);

      expect(res.ids).toEqual([mockEntities[0].id]);
      expect(res.count).toEqual(1);
      expect(res.date.getTime()).toBeLessThanOrEqual(new Date().getTime());
      expect(res.date.getTime()).toBeGreaterThanOrEqual(new Date().getTime() - 10000);
    });
  });

  describe('getAll', () => {
    it('should return all entities combined with their metadata', () => {
      const expected = mockEntities.map((e) => {
        const match = mockMetadatum.find((m) => m.id === e.id);
        return {
          entity: { ...e },
          metadata: { ...match },
          pinned: false,
        };
      });
      expect(useBaseCombinedStore.getAll()).toEqual(expected);
    });
  });

  describe('getById', () => {
    it('should return one entity combined with its metadata', () => {
      const { id } = mockEntities[0];
      const expected = {
        entity: { ...mockEntities[0] },
        metadata: { ...mockMetadatum[0] },
        pinned: false,
      };
      expect(useBaseCombinedStore.getById(id)).toEqual(expected);
    });
  });

  describe('getByCriteria', () => {
    it('should return a unique array of all entities combined with their metadata matching search criteria', () => {
      const result = useBaseCombinedStore.getByCriteria('Jane Smith', false, ['displayName']);
      expect(result[0].metadata.displayName).toContain('Jane Smith'); // From meta + search term
      expect(result[0].metadata.displayName).toEqual(mockMetadatum[0].displayName); // From meta
      expect(result[0].entity.status).toEqual(mockMetadatum[0].status); // From meta
      expect(result[0].entity.accountStatus).toEqual(mockEntities[0].accountStatus); // From entity
    });
  });

  describe('fetch', () => {
    it('should call action fetch from both module', async () => {
      const id = '1';
      entityStoreComponents.fetch = jest.fn();
      baseMetadataStoreComponents.fetch = jest.fn();
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);

      await useBaseCombinedStore.fetch(id, {
        useEntityGlobalHandler: GlobalHandler.Enabled,
        useMetadataGlobalHandler: GlobalHandler.Partial,
      });

      expect(entityStoreComponents.fetch).toBeCalledWith(id, GlobalHandler.Enabled);
      expect(baseMetadataStoreComponents.fetch).toBeCalledWith(id, GlobalHandler.Partial);
    });

    it('should return one entity combined with its metadata', async () => {
      const id = '1';
      entityStoreComponents.fetch = jest.fn(() => Promise.resolve(mockEntities[0]));
      baseMetadataStoreComponents.fetch = jest.fn(() => Promise.resolve(mockMetadatum[0]));
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);

      const res = await useBaseCombinedStore.fetch(id);
      const expected = { entity: mockEntities[0], metadata: mockMetadatum[0] };
      expect(res).toEqual(expected);
    });
  });

  describe('fetchAll', () => {
    it('should call action fetchAll from both module', async () => {
      const params: uuid = null;
      entityStoreComponents.fetchAll = jest.fn();
      baseMetadataStoreComponents.fetchAll = jest.fn();
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);

      await useBaseCombinedStore.fetchAll(params);

      expect(entityStoreComponents.fetchAll).toBeCalledWith(params);
      expect(baseMetadataStoreComponents.fetchAll).toBeCalledWith(params);
    });

    it('should return all entities combined with their metadata', async () => {
      entityStoreComponents.fetchAll = jest.fn(() => Promise.resolve(mockEntities));
      baseMetadataStoreComponents.fetchAll = jest.fn(() => Promise.resolve(mockMetadatum));
      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);

      const res = await useBaseCombinedStore.fetchAll();
      const expected = mockEntities.map((e) => {
        const match = mockMetadatum.find((m) => m.id === e.id);
        return {
          entity: e,
          metadata: match,
          pinned: false,
        };
      });
      expect(res).toEqual(expected);
    });
  });

  describe('fetchAllIncludingInactive', () => {
    it('should call action fetchAllIncludingInactive from both module', async () => {
      const params: uuid = null;
      entityStoreComponents.fetchAllIncludingInactive = jest.fn();
      baseMetadataStoreComponents.fetchAllIncludingInactive = jest.fn();

      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);
      await useBaseCombinedStore.fetchAllIncludingInactive(params);

      expect(entityStoreComponents.fetchAllIncludingInactive).toBeCalledWith(params);
      expect(baseMetadataStoreComponents.fetchAllIncludingInactive).toBeCalledWith(params);
    });

    it('should return all entities combined with their metadata', async () => {
      entityStoreComponents.fetchAllIncludingInactive = jest.fn(() => Promise.resolve(mockEntities));
      baseMetadataStoreComponents.fetchAllIncludingInactive = jest.fn(() => Promise.resolve(mockMetadatum));

      useBaseCombinedStore = createTestStore(entityStoreComponents, baseMetadataStoreComponents);

      const res = await useBaseCombinedStore.fetchAllIncludingInactive();

      const expected = mockEntities.map((e) => {
        const match = mockMetadatum.find((m) => m.id === e.id);
        return {
          entity: e,
          metadata: match,
          pinned: false,
        };
      });
      expect(res).toEqual(expected);
    });
  });
});
