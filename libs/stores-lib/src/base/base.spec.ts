import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { mockUserAccountEntities, mockUserAccountEntity } from '@libs/entities-lib/user-account';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { mockUserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { ICrcWindowObject } from '@libs/entities-lib/ICrcWindowObject';

import { setActivePinia, createPinia, defineStore } from 'pinia';
import { mockSignalR } from '@libs/shared-lib/signal-r';
import { getEntityStoreComponents } from './base';

const service = mockUserAccountsService();
const signalR = mockSignalR();
const id = '1';

const useBaseStore = defineStore('base', () => ({
  ...getEntityStoreComponents(service as any),
}));

let baseStore = null as ReturnType<typeof useBaseStore>;

describe('Base Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    baseStore = useBaseStore();
    applicationInsights.trackException = jest.fn();
  });

  describe('getAll', () => {
    it('should return all items from the state', () => {
      baseStore.setAll(mockUserAccountEntities());
      expect(baseStore.getAll()).toEqual(baseStore.items);
    });
  });

  describe('getById', () => {
    it('should return entity having this id', () => {
      baseStore.setAll(mockUserAccountEntities());
      expect(baseStore.getById(id)).toEqual(baseStore.items.find((e) => e.id === id));
    });
  });

  describe('getByCriteria', () => {
    it('should call filterCollectionByValue with correct params', () => {
      sharedHelpers.filterCollectionByValue = jest.fn();
      baseStore.getByCriteria('query', false, ['id', 'emailAddress']);
      expect(sharedHelpers.filterCollectionByValue).toHaveBeenCalledWith(baseStore.items, 'query', false, ['id', 'emailAddress']);
    });
  });

  describe('getNewlyCreatedIds', () => {
    it('should return the right list of Ids based on a time frame', () => {
      baseStore.newlyCreatedIds = [{ createdOn: new Date().getTime() - 2000, id: ' 1' },
        { createdOn: new Date().getTime() - 10000, id: ' 2' }, { createdOn: new Date().getTime() - 65000, id: ' 1' }];
      baseStore.maxTimeInSecondsForNewlyCreatedIds = 60;
      expect(baseStore.getNewlyCreatedIds()).toEqual([baseStore.newlyCreatedIds[0], baseStore.newlyCreatedIds[1]]);
      baseStore.maxTimeInSecondsForNewlyCreatedIds = 5;
      expect(baseStore.getNewlyCreatedIds()).toEqual([baseStore.newlyCreatedIds[0]]);
      expect(baseStore.getNewlyCreatedIds(new Date(baseStore.newlyCreatedIds[2].createdOn)))
        .toEqual([baseStore.newlyCreatedIds[0], baseStore.newlyCreatedIds[1], baseStore.newlyCreatedIds[2]]);
    });
  });

  describe('getByIds', () => {
    it('should return the right list of items', () => {
      baseStore.setAll(mockUserAccountEntities());
      const ids = ['1'];
      expect(baseStore.getByIds(ids)).toEqual([mockUserAccountEntities()[0]]);
      const ids2 = ['1', '2'];
      expect(baseStore.getByIds(ids2)).toEqual(mockUserAccountEntities());
    });
  });

  describe('fetch', () => {
    it('should call get method from the service', () => {
      service.get = jest.fn();
      baseStore.fetch(id, true);
      expect(service.get).toBeCalledWith(id, true);
    });

    it('should save result', async () => {
      const res = mockUserAccountEntity();
      service.get = jest.fn(() => res);
      await baseStore.fetch(id, true);
      expect(baseStore.items).toContain(res);
    });
  });

  describe('fetchAll', () => {
    it('should call getAll method from the service', async () => {
      service.getAll = jest.fn();
      await baseStore.fetchAll();
      expect(service.getAll).toBeCalledTimes(1);
    });

    it('should save result', async () => {
      const res = mockUserAccountEntities();
      service.getAll = jest.fn(() => res);
      await baseStore.fetchAll();
      expect(baseStore.items).toEqual(res);
    });
  });

  describe('fetchAllIncludingInactive', () => {
    it('should call getAll method from the service', async () => {
      service.getAllIncludingInactive = jest.fn();
      await baseStore.fetchAllIncludingInactive();
      expect(service.getAllIncludingInactive).toBeCalledTimes(1);
    });

    it('should save result', async () => {
      const res = mockUserAccountEntities();
      service.getAllIncludingInactive = jest.fn(() => res);
      await baseStore.fetchAllIncludingInactive();
      expect(baseStore.items).toEqual(res);
    });
  });

  describe('deactivate', () => {
    it('should call deactivate method from the service', async () => {
      service.deactivate = jest.fn();
      await baseStore.deactivate(id);
      expect(service.deactivate).toBeCalledWith(id);
    });

    // it('should save the result', async () => {
    //   const res = mockUserAccountEntity({ id });
    //   service.deactivate = jest.fn(() => res);
    //   await baseStore.deactivate(id);
    //   expect(baseStore.items).toContain(res);
    // });
  });

  describe('activate', () => {
    it('should call activate method from the service', async () => {
      service.activate = jest.fn();
      await baseStore.activate(id);
      expect(service.activate).toBeCalledWith(id);
    });

    // it('should save the result', async () => {
    //   const res = mockUserAccountEntity();
    //   service.activate = jest.fn(() => res);
    //   await baseStore.activate(id);
    //   expect(baseStore.items).toContain(res);
    // });
  });

  describe('search', () => {
    it('should call search method from the service', async () => {
      service.search = jest.fn();
      const params = { filter: { Foo: 'foo' } };
      const endpoint = 'bar';

      await baseStore.search({ params, searchEndpoint: endpoint });
      expect(service.search).toHaveBeenCalledWith(params, endpoint);
    });
  });

  describe('set', () => {
      it('should insert the entity if not existing', () => {
        const entity = mockUserAccountEntity();
        baseStore.set(entity);
        expect(baseStore.items)
          .toEqual([mockUserAccountEntity()]);
      });

      it('should update the entity if existing and if payload has a newer timestamp', () => {
        const entity = mockUserAccountEntity();
        const newerEntity = mockUserAccountEntity({ timestamp: '2050-04-06 06:39:04' });
        baseStore.set(entity);

        baseStore.set(newerEntity);

        expect(baseStore.items).toEqual([newerEntity]);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const entity = mockUserAccountEntity();
        const newerEntity = mockUserAccountEntity({ timestamp: '2000-04-06 06:39:04' });

        baseStore.set(entity);

        baseStore.set(newerEntity);

        expect(baseStore.items)
          .toEqual([entity]);
      });

      it('should call addSubscription from signalR instance', () => {
        const w: ICrcWindowObject = window;
        w.crcSingletons = { signalR: signalR.instance };
        const entity = mockUserAccountEntity();
        baseStore.set(entity);

        expect(signalR.instance.addSubscription)
          .toBeCalledWith(entity.id);
      });
    });

  describe('setAll', () => {
      it('should insert each entity if not existing', () => {
        const items = mockUserAccountEntities();
        baseStore.setAll(items);
        expect(baseStore.items).toEqual(items);
      });

      it('should update each entity if existing and if payload has a newer timestamp', () => {
        const items = mockUserAccountEntities();
        const payload = [
          mockUserAccountEntity({ id: '1', timestamp: '2050-04-06 06:39:04' }),
          mockUserAccountEntity({ id: '2', timestamp: '2050-04-06 06:39:04' }),
        ];

        baseStore.setAll(items);

        baseStore.setAll(payload);

        expect(baseStore.items).toEqual(payload);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const items = mockUserAccountEntities();
        const payload = [
          mockUserAccountEntity({ id: '1', timestamp: '2000-04-06 06:39:04' }),
          mockUserAccountEntity({ id: '2', timestamp: '2000-04-06 06:39:04' }),
        ];

        baseStore.setAll(items);

        baseStore.setAll(payload);

        expect(baseStore.items).toEqual(items);
      });
    });

  describe('setSearchLoading', () => {
      it('should mutate the state', () => {
        mockUserAccountEntities();
        baseStore.setSearchLoading(true);
        expect(baseStore.searchLoading).toEqual(true);
        baseStore.setSearchLoading(false);
        expect(baseStore.searchLoading).toEqual(false);
      });
    });

  describe('addNewlyCreatedId', () => {
      it('should mutate the state if the id wasnt already the array', () => {
        baseStore.addNewlyCreatedId(mockUserAccountEntity({ id: 'test me' }));
        expect(baseStore.newlyCreatedIds[0].id).toEqual('test me');
        expect(baseStore.newlyCreatedIds.length).toEqual(1);

        baseStore.addNewlyCreatedId(mockUserAccountEntity({ id: 'test me2' }));
        expect(baseStore.newlyCreatedIds[0].id).toEqual('test me2');
        expect(baseStore.newlyCreatedIds.length).toEqual(2);

        baseStore.addNewlyCreatedId(mockUserAccountEntity({ id: 'test me' }));
        expect(baseStore.newlyCreatedIds[0].id).toEqual('test me2');
        expect(baseStore.newlyCreatedIds.length).toEqual(2);
      });
    });
});
