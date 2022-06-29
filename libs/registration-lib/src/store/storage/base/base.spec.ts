import { IState, IStore, mockStore } from '../..';
import { mockUserAccountEntities, mockUserAccountMetadatum } from '../../../entities/user-account/userAccount.mock';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Base } from './index';

export type CombinedTest = any;
export type Entity = any;

export class BaseStorageTest extends Base<CombinedTest, Entity, uuid> {
  declare public readonly store: IStore<IState>;

  declare public readonly entityModuleName: string;

  declare public readonly metadataModuleName: string;

  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  public getters = {
    ...this.baseGetters,
  };

  public mutations = {
    ...this.baseMutations,
  };

  public actions = {
    ...this.baseActions,
  };
}

const entityModuleName = 'entityModule';
const metadataModuleName = 'metadataModule';
const mockEntities = mockUserAccountEntities();
const mockMetadatum = mockUserAccountMetadatum();

const store = mockStore({
  modules: {
    user: {
      getters: {
        userId: () => 'its me',
      },
    },
    entityModule: {
      getters: {
        'entityModule/getAll': () => mockEntities,
        'entityModule/getByCriteria': () => () => [mockEntities[0]],
        'entityModule/get': () => () => mockEntities[0],
        'entityModule/getByIds': () => (ids: string[]) => (mockEntities.filter((e: { id: string }) => ids.indexOf(e.id) > -1)),
      },
    },
    metadataModule: {
      getters: {
        'metadataModule/getAll': () => mockMetadatum,
        'metadataModule/getByCriteria': () => () => [mockMetadatum[0]],
        'metadataModule/get': () => () => mockMetadatum[0],
        'metadataModule/getByIds': () => () => [mockMetadatum[0]],
      },
      actions: {
        'metadataModule/fetch': () => () => [mockMetadatum[0]],
        'metadataModule/fetchAll': () => () => [mockMetadatum[0]],
        'metadataModule/fetchAllIncludingInactive': () => () => [mockMetadatum[0]],
      },
    },
  },
}, { commit: true, dispatch: true });
const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
const id = '1';

describe('BaseStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should instantiate store', () => {
      expect(storage.store).toEqual(store);
    });

    it('should instantiate entityModuleName', () => {
      expect(storage.entityModuleName).toEqual(entityModuleName);
    });

    it('should instantiate metadataModuleName', () => {
      expect(storage.metadataModuleName).toEqual(metadataModuleName);
    });
  });

  describe('baseGetters', () => {
    describe('getAll', () => {
      it('should return all entities combined with their metadata', () => {
        const expected = mockEntities.map((e: { id: any }) => {
          const match = mockMetadatum.find((m: { id: any }) => m.id === e.id);
          return {
            entity: { ...e },
            metadata: { ...match },
            pinned: false,
          };
        });
        expect(storage.getters.getAll()).toEqual(expected);
      });
    });

    describe('getNewlyCreatedIds', () => {
      it('should call store', () => {
        const res = {};
        const date = new Date('2020/01/10');
        store.getters['entityModule/getNewlyCreatedIds'] = jest.fn(() => res);
        expect(storage.getters.getNewlyCreatedIds(date)).toEqual(res);
        expect(store.getters['entityModule/getNewlyCreatedIds']).toHaveBeenCalledWith(date);
      });
    });

    describe('get', () => {
      it('should return one entity combined with its metadata', () => {
        const { id } = mockEntities[0];
        const expected = {
          entity: { ...mockEntities[0] },
          metadata: { ...mockMetadatum[0] },
          pinned: false,
        };
        expect(storage.getters.get(id)).toEqual(expected);
      });
    });

    describe('getByCriteria', () => {
      it('should return a unique array of all entities combined with their metadata matching search criteria', () => {
        const result = storage.getters.getByCriteria('Jane Smith', false, ['displayName']) as CombinedTest[];
        expect(result[0].metadata.displayName).toContain('Jane Smith'); // From meta + search term
        expect(result[0].metadata.displayName).toEqual(mockMetadatum[0].displayName); // From meta
        expect(result[0].entity.status).toEqual(mockMetadatum[0].status); // From meta
        expect(result[0].entity.accountStatus).toEqual(mockEntities[0].accountStatus); // From entity
      });
    });

    describe('getByIds', () => {
      it('should return a list of entities and metadata filtered by the ids', () => {
        const ids = [mockEntities[0].id];
        const expected = [{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: false }];
        expect(storage.getters.getByIds(ids)).toEqual(expected);
      });

      it('returns newlycreated items pinned according to id', () => {
        const ids = [mockEntities[0].id];
        store.getters['entityModule/getNewlyCreatedIds'] = jest.fn(() => [{ id: mockEntities[0].id }]);
        expect(storage.getters.getByIds(ids, { prependPinnedItems: true }))
          .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: true }]);

        expect(storage.getters.getByIds([], { prependPinnedItems: true }))
          .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: true }]);

        expect(storage.getters.getByIds([], { prependPinnedItems: false }))
          .toEqual([]);

        store.getters['entityModule/getNewlyCreatedIds'] = jest.fn(() => []);
        expect(storage.getters.getByIds(ids, { prependPinnedItems: true }))
          .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: false }]);
      });

      it('filters newlycreated items pinned according to parentId', () => {
        const ids: string[] = [];
        store.getters['entityModule/getNewlyCreatedIds'] = jest.fn(() => [{ id: mockEntities[0].id }]);
        // here we'll fake that tenantId is a parent of mockEntities
        expect(storage.getters.getByIds(ids, { prependPinnedItems: true, parentId: { tenantId: mockEntities[0].tenantId } as any }))
          .toEqual([{ entity: mockEntities[0], metadata: mockMetadatum[0], pinned: true }]);

        expect(storage.getters.getByIds(ids, { prependPinnedItems: true, parentId: { tenantId: 'nope' } as any }))
          .toEqual([]);
      });
    });
  });

  describe('baseActions', () => {
    describe('fetch', () => {
      it('should call action fetch from both module', async () => {
        await storage.actions.fetch(id, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false });
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/fetch`, { idParams: id, useGlobalHandler: true });
        expect(store.dispatch).toBeCalledWith(`${storage.metadataModuleName}/fetch`, { idParams: id, useGlobalHandler: false });
      });

      it('should return one entity combined with its metadata', async () => {
        store.dispatch = jest.fn()
          .mockReturnValueOnce(Promise.resolve(mockEntities[0]))
          .mockReturnValueOnce(Promise.resolve(mockMetadatum[0]));
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        const res = await storage.actions.fetch(id);
        const expected = { entity: mockEntities[0], metadata: mockMetadatum[0] };
        expect(res).toEqual(expected);
      });
    });

    describe('fetchAll', () => {
      it('should call action fetchAll from both module', async () => {
        const params: uuid = null;
        await storage.actions.fetchAll(params);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/fetchAll`, params);
        expect(store.dispatch).toBeCalledWith(`${storage.metadataModuleName}/fetchAll`, params);
      });

      it('should return all entities combined with their metadata', async () => {
        store.dispatch = jest.fn()
          .mockReturnValueOnce(Promise.resolve(mockEntities))
          .mockReturnValueOnce(Promise.resolve(mockMetadatum));
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        const res = await storage.actions.fetchAll();
        const expected = mockEntities.map((e: { id: any }) => {
          const match = mockMetadatum.find((m: { id: any }) => m.id === e.id);
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
        await storage.actions.fetchAllIncludingInactive();
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/fetchAllIncludingInactive`);
        expect(store.dispatch).toBeCalledWith(`${storage.metadataModuleName}/fetchAllIncludingInactive`);
      });

      it('should return all entities combined with their metadata', async () => {
        store.dispatch = jest.fn()
          .mockReturnValueOnce(Promise.resolve(mockEntities))
          .mockReturnValueOnce(Promise.resolve(mockMetadatum));
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        const res = await storage.actions.fetchAllIncludingInactive();
        const expected = mockEntities.map((e: { id: any }) => {
          const match = mockMetadatum.find((m: { id: any }) => m.id === e.id);
          return {
            entity: e,
            metadata: match,
            pinned: false,
          };
        });
        expect(res).toEqual(expected);
      });
    });

    describe('deactivate', () => {
      it('should call action deactivate from entity module', async () => {
        await storage.actions.deactivate(id);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/deactivate`, id);
      });
    });

    describe('activate', () => {
      it('should call action activate from entity module', async () => {
        await storage.actions.activate(id);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/activate`, id);
      });
    });

    describe('search', () => {
      it('should call action search with the payload', async () => {
        const params = { filter: { Foo: 'foo' } };
        await storage.actions.search(params, null, true);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/search`, { params, searchEndpoint: null });
      });

      it('should filter out inactive by default or if specified', async () => {
        const params = { filter: { Foo: 'foo' } };
        await storage.actions.search(params);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/search`,
          { params: { filter: { Foo: 'foo', 'Entity/Status': 1 } }, searchEndpoint: null });
        jest.clearAllMocks();

        await storage.actions.search(params, null, false);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/search`,
          { params: { filter: { Foo: 'foo', 'Entity/Status': 1 } }, searchEndpoint: null });
        jest.clearAllMocks();

        const paramsNoFilter = { filter: '' };
        await storage.actions.search(paramsNoFilter, null, false);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/search`,
          { params: { filter: { 'Entity/Status': 1 } }, searchEndpoint: null });
      });

      it('should filterout inactives by default or if specified and build the correct filter when the filter is a string', async () => {
        const params = { filter: 'filter string' };
        await storage.actions.search(params);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/search`,
          { params: { filter: 'filter string and Entity/Status eq 1' }, searchEndpoint: null });
      });

      it('should call commit setAll for both entity and metadata', async () => {
        store.dispatch = jest.fn().mockReturnValueOnce(Promise.resolve(
          {
            odataContext: 'foo',
            odataCount: 1,
            value: [{
              entityETag: 'mock-Entity-Etag', metadataETag: 'mock-metadata-Etag', entity: mockEntities[0], metadata: mockMetadatum[0],
            }],
          },
        ));

        const params = { filter: { Foo: 'foo' } };
        await storage.actions.search(params);
        expect(store.commit).toBeCalledWith(`${storage.entityModuleName}/setAll`, [{ ...mockEntities[0] }]);
        expect(store.commit).toBeCalledWith(`${storage.metadataModuleName}/setAll`, [{ ...mockMetadatum[0] }]);
      });

      it('should return a list of ids and the total count of items', async () => {
        store.dispatch = jest.fn().mockReturnValueOnce(Promise.resolve(
          {
            odataContext: 'foo',
            odataCount: 1,
            value: [{
              entityETag: 'mock-Entity-Etag', metadataETag: 'mock-metadata-Etag', entity: mockEntities[0], metadata: mockMetadatum[0],
            }],
          },
        ));

        const params = { filter: { Foo: 'foo' } };
        const res = await storage.actions.search(params);
        expect(res.ids).toEqual([mockEntities[0].id]);
        expect(res.count).toEqual(1);
        expect(res.date.getTime()).toBeLessThanOrEqual(new Date().getTime());
        expect(res.date.getTime()).toBeGreaterThanOrEqual(new Date().getTime() - 10000);
      });
    });
  });

  describe('baseMutations', () => {
    describe('setEntityFromOutsideNotification', () => {
      it('should proxy set mutation if the entity is already in the store', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);

        const payload = mockEntities[0];
        (storage as any).baseGetters.get = (): any => ({ entity: mockEntities[0] });
        storage.mutations.setEntityFromOutsideNotification(payload);
        expect(store.commit).toHaveBeenCalledWith(`${storage.entityModuleName}/set`, payload);
      });

      it('should not proxy set mutation if the entity is not already in the store', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        (storage as any).baseGetters.get = (): any => null;
        const payload = mockEntities[0];
        storage.mutations.setEntityFromOutsideNotification(payload);
        expect(store.commit).not.toHaveBeenCalled();
      });

      it('should proxy set mutation if the entity was changed by the user', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        (storage as any).userId = jest.fn(() => 'its me');
        const payload = mockEntities[0];
        payload.lastUpdatedBy = 'its me';
        (storage as any).baseGetters.get = (): any => null;
        storage.mutations.setEntityFromOutsideNotification(payload);
        expect(store.commit).toHaveBeenCalledWith(`${storage.entityModuleName}/set`, payload);
      });

      it('should not proxy set mutation if the entity is not changed by the user', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);

        const payload = mockEntities[0];
        payload.lastUpdatedBy = 'its not me';
        (storage as any).baseGetters.get = (): any => null;
        storage.mutations.setEntityFromOutsideNotification(payload);
        expect(store.commit).not.toHaveBeenCalled();
      });
    });

    describe('setEntity', () => {
      it('should proxy set mutation from the entity module only', () => {
        const payload = {};
        storage.mutations.setEntity(payload);
        expect(store.commit).toBeCalledWith(`${storage.entityModuleName}/set`, payload);
      });
    });

    describe('setAllEntities', () => {
      it('should proxy setAll mutation from the entity module only', () => {
        const payload = [{}, {}];
        storage.mutations.setAllEntities(payload);
        expect(store.commit).toBeCalledWith(`${storage.entityModuleName}/setAll`, payload);
      });
    });

    describe('setMetadata', () => {
      it('should proxy set mutation from the metadata module only', () => {
        const payload = {};
        storage.mutations.setMetadata(payload);
        expect(store.commit).toBeCalledWith(`${storage.metadataModuleName}/set`, payload);
      });
    });

    describe('setMetadataFromOutsideNotification', () => {
      it('should proxy set mutation if the entity is already in the store', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        const payload = mockEntities[0];

        (storage as any).baseGetters.get = (): any => ({ entity: mockEntities[0] });
        storage.mutations.setMetadataFromOutsideNotification(payload);
        expect(store.commit).toHaveBeenCalledWith(`${storage.metadataModuleName}/set`, payload);
      });

      it('should not proxy set mutation if the entity is not already in the store', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        (storage as any).baseGetters.get = (): any => null;
        const payload = mockEntities[0];
        storage.mutations.setMetadataFromOutsideNotification(payload);
        expect(store.commit).not.toHaveBeenCalled();
      });

      it('should proxy set mutation if the entity was changed by the user', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        (storage as any).userId = jest.fn(() => 'its me');
        const payload = mockEntities[0];
        payload.lastUpdatedBy = 'its me';
        (storage as any).baseGetters.get = (): any => null;
        storage.mutations.setMetadataFromOutsideNotification(payload);
        expect(store.commit).toHaveBeenCalledWith(`${storage.metadataModuleName}/set`, payload);
      });

      it('should not proxy set mutation if the entity is not changed by the user', () => {
        jest.clearAllMocks();
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);

        const payload = mockEntities[0];
        payload.lastUpdatedBy = 'its not me';
        (storage as any).baseGetters.get = (): any => null;
        storage.mutations.setMetadataFromOutsideNotification(payload);
        expect(store.commit).not.toHaveBeenCalled();
      });
    });

    describe('setAllMetadata', () => {
      it('should proxy setAll mutation from the entity module only', () => {
        const payload = [{}, {}];
        storage.mutations.setAllMetadata(payload);
        expect(store.commit).toBeCalledWith(`${storage.metadataModuleName}/setAll`, payload);
      });
    });
    describe('reset', () => {
      it('should reset all entities and metadata', () => {
        storage.mutations.reset();
        expect(store.commit).toBeCalledWith(`${storage.metadataModuleName}/reset`);
        expect(store.commit).toBeCalledWith(`${storage.entityModuleName}/reset`);
      });
    });
  });

  describe('make', () => {
    it('should return an object containing getters, actions and mutations', () => {
      expect(storage.make()).toEqual({
        getters: storage.getters,
        actions: storage.actions,
        mutations: storage.mutations,
      });
    });
  });
});
