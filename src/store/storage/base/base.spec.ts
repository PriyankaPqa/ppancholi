import { IState, IStore, mockStore } from '@/store';
import { mockUserAccountEntities, mockUserAccountMetadatum } from '@/entities/user-account';
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
const mockEntities = mockUserAccountEntities();
const mockMetadatum = mockUserAccountMetadatum();

const store = mockStore({
  modules: {
    entityModule: {
      getters: {
        'entityModule/getAll': () => mockEntities,
        'entityModule/getByCriteria': () => () => [mockEntities[0]],
        'entityModule/get': () => () => mockEntities[0],
      },
    },
    metadataModule: {
      getters: {
        'metadataModule/getAll': () => mockMetadatum,
        'metadataModule/getByCriteria': () => () => [mockMetadatum[0]],
        'metadataModule/get': () => () => mockMetadatum[0],
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
        const result = storage.getters.getByCriteria('Jane Smith', false, ['displayName']) as CombinedTest[];
        expect(result[0].metadata.displayName).toContain('Jane Smith'); // From meta + search term
        expect(result[0].metadata.displayName).toEqual(mockMetadatum[0].displayName); // From meta
        expect(result[0].entity.status).toEqual(mockMetadatum[0].status); // From meta
        expect(result[0].entity.accountStatus).toEqual(mockEntities[0].accountStatus); // From entity
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
  });

  describe('baseMutations', () => {
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

    describe('setAllMetadata', () => {
      it('should proxy setAll mutation from the entity module only', () => {
        const payload = [{}, {}];
        storage.mutations.setAllMetadata(payload);
        expect(store.commit).toBeCalledWith(`${storage.metadataModuleName}/setAll`, payload);
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
