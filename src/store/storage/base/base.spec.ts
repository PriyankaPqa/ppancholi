import { IState, IStore, mockStore } from '@/store';
import { mockBaseEntities, mockBaseMetadatum } from '../../../entities/base';
import { Base } from './index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CombinedTest = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Entity = any;

export class BaseStorageTest extends Base<CombinedTest, Entity> {
  public readonly store: IStore<IState>;

  public readonly entityModuleName: string;

  public readonly metadataModuleName: string;

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
const mockEntities = mockBaseEntities();
// eslint-disable-next-line
const mockMetadatum = mockBaseMetadatum() as any[];

const store = mockStore({
  modules: {
    entityModule: {
      getters: {
        'entityModule/getAll': () => mockEntities,
        'entityModule/getByCriteria': () => () => [mockEntities[0]],
        'entityModule/get': () => () => mockEntities[0],
        'entityModule/getByIds': () => () => [mockEntities[0]],
      },
    },
    metadataModule: {
      getters: {
        'metadataModule/getAll': () => mockMetadatum,
        'metadataModule/getByCriteria': () => () => [mockMetadatum[0]],
        'metadataModule/get': () => () => mockMetadatum[0],
        'metadataModule/getByIds': () => () => [mockMetadatum[0]],
      },
    },
  },
}, { commit: true, dispatch: true });
const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
const id = '1';

describe('BaseStorage', () => {
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
        const expected = mockEntities.map((e) => {
          const match = mockMetadatum.find((m) => m.id === e.id);
          return {
            entity: { ...e },
            metadata: { ...match },
          };
        });
        expect(storage.getters.getAll()).toEqual(expected);
      });
    });

    describe('get', () => {
      it('should return one entity combined with its metadata', () => {
        const { id } = mockEntities[0];
        const expected = { entity: { ...mockEntities[0] }, metadata: { ...mockMetadatum[0] } };
        expect(storage.getters.get(id)).toEqual(expected);
      });
    });

    describe('getByCriteria', () => {
      it('should return a unique array of all entities combined with their metadata matching search criteria', () => {
        const result = storage.getters.getByCriteria('propA', false, ['propA']) as CombinedTest[];
        expect(result[0].metadata.propA).toContain('propA'); // From meta + search term
        expect(result[0].metadata.propA).toEqual(mockMetadatum[0].propA); // From meta
        expect(result[0].entity.status).toEqual(mockMetadatum[0].status); // From meta
        expect(result[0].entity.id).toEqual(mockEntities[0].id); // From entity
      });
    });

    describe('getByIds', () => {
      it('should return a list of entities and metadata filtered by the ids', () => {
        const ids = [mockEntities[0].id];
        const expected = [{ entity: mockEntities[0], metadata: mockMetadatum[0] }];
        expect(storage.getters.getByIds(ids)).toEqual(expected);
      });
    });
  });

  describe('baseActions', () => {
    describe('fetch', () => {
      it('should call action fetch from both module', async () => {
        await storage.actions.fetch(id);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/fetch`, id);
        expect(store.dispatch).toBeCalledWith(`${storage.metadataModuleName}/fetch`, id);
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
        await storage.actions.fetchAll();
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/fetchAll`);
        expect(store.dispatch).toBeCalledWith(`${storage.metadataModuleName}/fetchAll`);
      });

      it('should return all entities combined with their metadata', async () => {
        store.dispatch = jest.fn()
          .mockReturnValueOnce(Promise.resolve(mockEntities))
          .mockReturnValueOnce(Promise.resolve(mockMetadatum));
        const storage = new BaseStorageTest(store, entityModuleName, metadataModuleName);
        const res = await storage.actions.fetchAll();
        const expected = mockEntities.map((e) => {
          const match = mockMetadatum.find((m) => m.id === e.id);
          return {
            entity: { ...e },
            metadata: { ...match },
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
        const expected = mockEntities.map((e) => {
          const match = mockMetadatum.find((m) => m.id === e.id);
          return {
            entity: e,
            metadata: match,
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
        const params = { filter: 'foo' };
        await storage.actions.search(params);
        expect(store.dispatch).toBeCalledWith(`${storage.entityModuleName}/search`, { params, searchEndpoint: null });
      });

      it('should call commit set for both entity and metadata', async () => {
        store.dispatch = jest.fn().mockReturnValueOnce(Promise.resolve(
          {
            odataContext: 'foo',
            odataCount: 1,
            value: [{
              entityETag: 'mock-Entity-Etag', metadataETag: 'mock-metadata-Etag', entity: mockEntities[0], metadata: mockMetadatum[0],
            }],
          },
        ));

        const params = { filter: 'foo' };
        await storage.actions.search(params);
        expect(store.commit).toBeCalledWith(`${storage.entityModuleName}/set`, { ...mockEntities[0], eTag: 'mock-Entity-Etag' });
        expect(store.commit).toBeCalledWith(`${storage.metadataModuleName}/set`, { ...mockMetadatum[0], eTag: 'mock-metadata-Etag' });
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

        const params = { filter: 'foo' };
        const res = await storage.actions.search(params);
        expect(res).toEqual({ ids: [mockEntities[0].id], count: 1 });
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
