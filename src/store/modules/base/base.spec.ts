/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionContext } from 'vuex';
import { DomainBaseService } from '../../../services/base';
import { httpClient } from '../../../services/httpClient';
import { mockBaseEntities, mockBaseEntity } from '../../../entities/base';
import helpers from '../../../ui/helpers';
import { BaseModule } from './index';
import { IState } from './base.types';

export class BaseModuleTest extends BaseModule<any> {
  public service: DomainBaseService<any>

  constructor(protected pService: DomainBaseService<any>) {
    super(pService);
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

const service = new DomainBaseService(httpClient, '', '');
const baseModule = new BaseModuleTest(service);

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
  describe('constructor', () => {
    it('should instantiate a service', () => {
      expect(baseModule.service).toEqual(service);
    });
  });

  describe('baseGetters', () => {
    describe('getAll', () => {
      it('should return all items from the state', () => {
        baseModule.mutations.setAll(baseModule.state, mockBaseEntities());
        expect(baseModule.getters.getAll(baseModule.state)).toEqual(baseModule.state.items);
      });
    });

    describe('get', () => {
      it('should return entity having this id', () => {
        baseModule.mutations.setAll(baseModule.state, mockBaseEntities());
        expect(baseModule.getters.get(baseModule.state)(id)).toEqual(baseModule.state.items.find((e) => e.id === id));
      });
    });

    describe('getBy', () => {
      it('should call filterCollectionByValue with correct params', () => {
        helpers.filterCollectionByValue = jest.fn();
        baseModule.getters.getByCriteria(baseModule.state)('query', false, ['id', 'emailAddress']);
        expect(helpers.filterCollectionByValue).toHaveBeenCalledWith(baseModule.state.items, 'query', false, ['id', 'emailAddress']);
      });
    });
  });

  describe('baseActions', () => {
    describe('fetch', () => {
      it('should call get method from the service', () => {
        baseModule.service.get = jest.fn();
        baseModule.actions.fetch(actionContext, id);

        expect(baseModule.service.get).toBeCalledWith(id);
      });

      it('should commit set mutation with the result', async () => {
        const res = mockBaseEntity();
        baseModule.service.get = jest.fn(() => Promise.resolve(res));

        await baseModule.actions.fetch(actionContext, id);

        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('fetchAll', () => {
      it('should call getAll method from the service', async () => {
        baseModule.service.getAll = jest.fn();
        await baseModule.actions.fetchAll(actionContext);
        expect(baseModule.service.getAll).toBeCalledTimes(1);
      });

      it('should commit setAll mutation with the result', async () => {
        const res = mockBaseEntities();
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
        const res = mockBaseEntities();
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
        const res = mockBaseEntity();
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
        const res = mockBaseEntity();
        baseModule.service.activate = jest.fn(() => Promise.resolve(res));

        await baseModule.actions.activate(actionContext, id);

        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });
  });

  describe('baseMutations', () => {
    describe('set', () => {
      it('should insert the entity if not existing', () => {
        const baseModule = new BaseModuleTest(service);
        const entity = mockBaseEntity();
        baseModule.mutations.set(baseModule.state, entity);
        expect(baseModule.state.items).toEqual([mockBaseEntity()]);
      });
      it('should update the entity if existing and if payload has a newer timestamp', () => {
        const baseModule = new BaseModuleTest(service);
        const entity = mockBaseEntity();
        const newerEntity = mockBaseEntity({ timestamp: '2050-04-06 06:39:04' });
        baseModule.mutations.set(baseModule.state, entity);

        baseModule.mutations.set(baseModule.state, newerEntity);

        expect(baseModule.state.items).toEqual([newerEntity]);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const baseModule = new BaseModuleTest(service);
        const entity = mockBaseEntity();
        const newerEntity = mockBaseEntity({ timestamp: '2000-04-06 06:39:04' });

        baseModule.mutations.set(baseModule.state, entity);

        baseModule.mutations.set(baseModule.state, newerEntity);

        expect(baseModule.state.items).toEqual([entity]);
      });
    });

    describe('upsert', () => {
      it('should insert the entity if not existing', () => {
        const baseModule = new BaseModuleTest(service);
        const entity = mockBaseEntity();
        baseModule.mutations.upsert(baseModule.state, entity);
        expect(baseModule.state.items).toEqual([entity]);
      });

      it('should update the entity if existing and if payload has a newer timestamp', () => {
        const baseModule = new BaseModuleTest(service);
        const entity = mockBaseEntity();
        const payload = mockBaseEntity({ timestamp: '2050-04-06 06:39:04' });
        baseModule.mutations.upsert(baseModule.state, entity);

        baseModule.mutations.upsert(baseModule.state, payload);

        expect(baseModule.state.items).toEqual([payload]);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const baseModule = new BaseModuleTest(service);
        const entity = mockBaseEntity();
        const payload = mockBaseEntity({ timestamp: '2000-04-06 06:39:04' });

        baseModule.mutations.upsert(baseModule.state, entity);

        baseModule.mutations.upsert(baseModule.state, payload);

        expect(baseModule.state.items).toEqual([entity]);
      });
    });

    describe('setAll', () => {
      it('should insert each entity if not existing', () => {
        const baseModule = new BaseModuleTest(service);
        const items = mockBaseEntities();
        baseModule.mutations.upsert(baseModule.state, items);
        expect(baseModule.state.items).toEqual([items]);
      });

      it('should update each entity if existing and if payload has a newer timestamp', () => {
        const baseModule = new BaseModuleTest(service);
        const items = mockBaseEntities();
        const payload = [
          mockBaseEntity({ id: '1', timestamp: '2050-04-06 06:39:04' }),
          mockBaseEntity({ id: '2', timestamp: '2050-04-06 06:39:04' }),
        ];

        baseModule.mutations.setAll(baseModule.state, items);

        baseModule.mutations.setAll(baseModule.state, payload);

        expect(baseModule.state.items).toEqual(payload);
      });

      it('should do nothing if entity exists and if payload has a older timestamp', () => {
        const baseModule = new BaseModuleTest(service);
        const items = mockBaseEntities();
        const payload = [
          mockBaseEntity({ id: '1', timestamp: '2000-04-06 06:39:04' }),
          mockBaseEntity({ id: '2', timestamp: '2000-04-06 06:39:04' }),
        ];

        baseModule.mutations.setAll(baseModule.state, items);

        baseModule.mutations.setAll(baseModule.state, payload);

        expect(baseModule.state.items).toEqual(items);
      });
    });

    describe('reset', () => {
      it('should reset items', () => {
        const baseModule = new BaseModuleTest(service);
        const entity = mockBaseEntity();

        baseModule.mutations.set(baseModule.state, entity);
        baseModule.mutations.reset(baseModule.state);

        expect(baseModule.state.items).toEqual([]);
      });
    });
  });

  describe('getModule', () => {
    it('should return a module object to be used in initialization of the store', () => {
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
