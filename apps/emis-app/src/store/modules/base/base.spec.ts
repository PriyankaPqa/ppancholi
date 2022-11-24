import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionContext } from 'vuex';
import { DomainBaseService } from '@libs/services-lib/base';
import { httpClient } from '@/services/httpClient';
import { mockUserAccountEntities, mockUserAccountEntity } from '@libs/entities-lib/user-account';
import helpers from '@/ui/helpers/helpers';
import { mockIRestResponse } from '@libs/services-lib/http-client';
import { BaseModule } from './index';
import { IState } from './base.types';
import { ISignalRMock, mockSignalR } from '../../../ui/plugins/signal-r';

export class BaseModuleTest extends BaseModule<any, uuid> {
  declare public service: DomainBaseService<any, uuid>;

  constructor(protected pService: DomainBaseService<any, uuid>, protected signalR: ISignalRMock) {
    super(pService, signalR);
  }

  public state = {
    ...this.baseState,
  };

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
const signalR = mockSignalR();

const service = new DomainBaseService(httpClient, '', '');
const baseModule = new BaseModuleTest(service, signalR);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: null,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IState<never>, IState<never>>;

const id = '1';

describe('Base Module', () => {
  beforeEach(() => {
    applicationInsights.trackException = jest.fn();
  });
  describe('constructor', () => {
    it('should instantiate a service', () => {
      expect(baseModule.service).toEqual(service);
    });
  });

  describe('baseGetters', () => {
    describe('getAll', () => {
      it('should return all items from the state', () => {
        baseModule.mutations.setAll(baseModule.state, mockUserAccountEntities());
        expect(baseModule.getters.getAll(baseModule.state)).toEqual(baseModule.state.items);
      });
    });

    describe('get', () => {
      it('should return entity having this id', () => {
        baseModule.mutations.setAll(baseModule.state, mockUserAccountEntities());
        expect(baseModule.getters.get(baseModule.state)(id)).toEqual(baseModule.state.items.find((e) => e.id === id));
      });
    });

    describe('getByCriteria', () => {
      it('should call filterCollectionByValue with correct params', () => {
        helpers.filterCollectionByValue = jest.fn();
        baseModule.getters.getByCriteria(baseModule.state)('query', false, ['id', 'emailAddress']);
        expect(helpers.filterCollectionByValue).toHaveBeenCalledWith(baseModule.state.items, 'query', false, ['id', 'emailAddress']);
      });
    });

    describe('getNewlyCreatedIds', () => {
      it('should return the right list of Ids based on a time frame', () => {
        baseModule.state.newlyCreatedIds = [{ createdOn: new Date().getTime() - 2000, id: ' 1' },
          { createdOn: new Date().getTime() - 10000, id: ' 2' }, { createdOn: new Date().getTime() - 65000, id: ' 1' }];
        baseModule.state.maxTimeInSecondsForNewlyCreatedIds = 60;
        expect(baseModule.getters.getNewlyCreatedIds(baseModule.state)())
          .toEqual([baseModule.state.newlyCreatedIds[0], baseModule.state.newlyCreatedIds[1]]);
        baseModule.state.maxTimeInSecondsForNewlyCreatedIds = 5;
        expect(baseModule.getters.getNewlyCreatedIds(baseModule.state)())
          .toEqual([baseModule.state.newlyCreatedIds[0]]);
        expect(baseModule.getters.getNewlyCreatedIds(baseModule.state)(new Date(baseModule.state.newlyCreatedIds[2].createdOn)))
          .toEqual([baseModule.state.newlyCreatedIds[0], baseModule.state.newlyCreatedIds[1], baseModule.state.newlyCreatedIds[2]]);
      });
    });

    describe('getByIds', () => {
      it('should return the right list of items', () => {
        baseModule.mutations.setAll(baseModule.state, mockUserAccountEntities());
        const ids = ['1'];
        expect(baseModule.getters.getByIds(baseModule.state)(ids)).toEqual([mockUserAccountEntities()[0]]);
        const ids2 = ['1', '2'];
        expect(baseModule.getters.getByIds(baseModule.state)(ids2)).toEqual(mockUserAccountEntities());
      });
    });
  });

  describe('baseActions', () => {
    describe('fetch', () => {
      describe('returnFullResponse false', () => {
        it('should call get method from the service', () => {
          baseModule.service.get = jest.fn();
          baseModule.actions.fetch(actionContext, { idParams: id, useGlobalHandler: true });

          expect(baseModule.service.get).toBeCalledWith(id, true);
        });

        it('should commit set mutation with the result', async () => {
          const res = mockUserAccountEntity();
          baseModule.service.get = jest.fn(() => Promise.resolve(res));

          await baseModule.actions.fetch(actionContext, { idParams: id, useGlobalHandler: true });

          expect(actionContext.commit).toBeCalledWith('set', res);
        });
      });

      describe('returnFullResponse true', () => {
        it('should call getFullResponse method from the service', () => {
          const res = mockIRestResponse(mockUserAccountEntity());
          baseModule.service.getFullResponse = jest.fn(() => Promise.resolve(res));
          baseModule.actions.fetch(actionContext, { idParams: id, useGlobalHandler: true, returnFullResponse: true });

          expect(baseModule.service.getFullResponse).toBeCalledWith(id, true);
        });

        it('should commit set mutation with the result', async () => {
          const res = mockIRestResponse(mockUserAccountEntity());
          baseModule.service.getFullResponse = jest.fn(() => Promise.resolve(res));

          await baseModule.actions.fetch(actionContext, { idParams: id, useGlobalHandler: true, returnFullResponse: true });

          expect(actionContext.commit).toBeCalledWith('set', res.data);
        });
      });
    });

    describe('fetchAll', () => {
      it('should call getAll method from the service', async () => {
        baseModule.service.getAll = jest.fn();
        await baseModule.actions.fetchAll(actionContext);
        expect(baseModule.service.getAll).toBeCalledTimes(1);
      });

      it('should commit setAll mutation with the result', async () => {
        const res = mockUserAccountEntities();
        baseModule.service.getAll = jest.fn(() => Promise.resolve(res));

        await baseModule.actions.fetchAll(actionContext);

        expect(actionContext.commit).toBeCalledWith('setAll', res);
      });
    });

    describe('fetchAllIncludingInactive', () => {
      it('should call getAll method from the service', async () => {
        baseModule.service.getAllIncludingInactive = jest.fn();
        await baseModule.actions.fetchAllIncludingInactive(actionContext);
        expect(baseModule.service.getAllIncludingInactive).toBeCalledTimes(1);
      });

      it('should commit setAll mutation with the result', async () => {
        const res = mockUserAccountEntities();
        baseModule.service.getAllIncludingInactive = jest.fn(() => Promise.resolve(res));

        await baseModule.actions.fetchAllIncludingInactive(actionContext);

        expect(actionContext.commit).toBeCalledWith('setAll', res);
      });
    });

    describe('deactivate', () => {
      it('should call deactivate method from the service', async () => {
        baseModule.service.deactivate = jest.fn();
        await baseModule.actions.deactivate(actionContext, id);
        expect(baseModule.service.deactivate).toBeCalledWith(id);
      });

      it('should commit set mutation with the result', async () => {
        const res = mockUserAccountEntity();
        baseModule.service.deactivate = jest.fn(() => Promise.resolve(res));

        await baseModule.actions.deactivate(actionContext, id);

        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('activate', () => {
      it('should call activate method from the service', async () => {
        baseModule.service.activate = jest.fn();
        await baseModule.actions.activate(actionContext, id);
        expect(baseModule.service.activate).toBeCalledWith(id);
      });

      it('should commit set mutation with the result', async () => {
        const res = mockUserAccountEntity();
        baseModule.service.activate = jest.fn(() => Promise.resolve(res));

        await baseModule.actions.activate(actionContext, id);

        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('search', () => {
      it('should call search method from the service', async () => {
        baseModule.service.search = jest.fn();
        const params = { filter: { Foo: 'foo' } };
        const endpoint = 'bar';

        await baseModule.actions.search(actionContext, { params, searchEndpoint: endpoint });
        expect(baseModule.service.search).toHaveBeenCalledWith(params, endpoint);
      });
    });
  });

  describe('baseMutations', () => {
    describe('set', () => {
      it('should insert the entity if not existing', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const entity = mockUserAccountEntity();
        baseModule.mutations.set(baseModule.state, entity);
        expect(baseModule.state.items).toEqual([mockUserAccountEntity()]);
      });
      it('should update the entity if existing and if payload has a newer timestamp', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const entity = mockUserAccountEntity();
        const newerEntity = mockUserAccountEntity({ timestamp: '2050-04-06 06:39:04' });
        baseModule.mutations.set(baseModule.state, entity);

        baseModule.mutations.set(baseModule.state, newerEntity);

        expect(baseModule.state.items).toEqual([newerEntity]);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const entity = mockUserAccountEntity();
        const newerEntity = mockUserAccountEntity({ timestamp: '2000-04-06 06:39:04' });

        baseModule.mutations.set(baseModule.state, entity);

        baseModule.mutations.set(baseModule.state, newerEntity);

        expect(baseModule.state.items).toEqual([entity]);
      });
    });

    describe('upsert', () => {
      it('should insert the entity if not existing', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const entity = mockUserAccountEntity();
        baseModule.mutations.upsert(baseModule.state, entity);
        expect(baseModule.state.items).toEqual([entity]);
      });

      it('should update the entity if existing and if payload has a newer timestamp', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const entity = mockUserAccountEntity();
        const payload = mockUserAccountEntity({ timestamp: '2050-04-06 06:39:04' });
        baseModule.mutations.upsert(baseModule.state, entity);

        baseModule.mutations.upsert(baseModule.state, payload);

        expect(baseModule.state.items).toEqual([payload]);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const entity = mockUserAccountEntity();
        const payload = mockUserAccountEntity({ timestamp: '2000-04-06 06:39:04' });

        baseModule.mutations.upsert(baseModule.state, entity);

        baseModule.mutations.upsert(baseModule.state, payload);

        expect(baseModule.state.items).toEqual([entity]);
      });

      it('should call addSubscription from signalR instance', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const entity = mockUserAccountEntity();
        baseModule.mutations.upsert(baseModule.state, entity);

        expect(signalR.instance.addSubscription).toBeCalledWith(entity.id);
      });
    });

    describe('setAll', () => {
      it('should insert each entity if not existing', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const items = mockUserAccountEntities();
        baseModule.mutations.upsert(baseModule.state, items);
        expect(baseModule.state.items).toEqual([items]);
      });

      it('should update each entity if existing and if payload has a newer timestamp', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const items = mockUserAccountEntities();
        const payload = [
          mockUserAccountEntity({ id: '1', timestamp: '2050-04-06 06:39:04' }),
          mockUserAccountEntity({ id: '2', timestamp: '2050-04-06 06:39:04' }),
        ];

        baseModule.mutations.setAll(baseModule.state, items);

        baseModule.mutations.setAll(baseModule.state, payload);

        expect(baseModule.state.items).toEqual(payload);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        const items = mockUserAccountEntities();
        const payload = [
          mockUserAccountEntity({ id: '1', timestamp: '2000-04-06 06:39:04' }),
          mockUserAccountEntity({ id: '2', timestamp: '2000-04-06 06:39:04' }),
        ];

        baseModule.mutations.setAll(baseModule.state, items);

        baseModule.mutations.setAll(baseModule.state, payload);

        expect(baseModule.state.items).toEqual(items);
      });
    });

    describe('setSearchLoading', () => {
      it('should mutate the state', () => {
        const baseModule = new BaseModuleTest(service, signalR);
        mockUserAccountEntities();
        baseModule.mutations.setSearchLoading(baseModule.state, true);
        expect(baseModule.state.searchLoading).toEqual(true);
        baseModule.mutations.setSearchLoading(baseModule.state, false);
        expect(baseModule.state.searchLoading).toEqual(false);
      });
    });

    describe('addNewlyCreatedId', () => {
      it('should mutate the state if the id wasnt already the array', () => {
        const baseModule = new BaseModuleTest(service, signalR);

        baseModule.mutations.addNewlyCreatedId(baseModule.state, { id: 'test me' });
        expect(baseModule.state.newlyCreatedIds[0].id).toEqual('test me');
        expect(baseModule.state.newlyCreatedIds.length).toEqual(1);

        baseModule.mutations.addNewlyCreatedId(baseModule.state, { id: 'test me2' });
        expect(baseModule.state.newlyCreatedIds[0].id).toEqual('test me2');
        expect(baseModule.state.newlyCreatedIds.length).toEqual(2);

        baseModule.mutations.addNewlyCreatedId(baseModule.state, { id: 'test me' });
        expect(baseModule.state.newlyCreatedIds[0].id).toEqual('test me2');
        expect(baseModule.state.newlyCreatedIds.length).toEqual(2);
      });
    });
  });

  describe('getModule', () => {
    it('should return a module object to be used in initialization of the store', () => {
      const baseModule = new BaseModuleTest(service, signalR);
      expect(baseModule.getModule()).toEqual({
        namespaced: true,
        state: baseModule.state,
        getters: baseModule.getters,
        actions: baseModule.actions,
        mutations: baseModule.mutations,
      });
    });
  });
});
