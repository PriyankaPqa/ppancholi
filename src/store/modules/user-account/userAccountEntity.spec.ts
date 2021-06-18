/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAccountsService, IAddRoleToUserRequest } from '@/services/user-accounts/entity';
import { httpClient } from '@/services/httpClient';
import {
  FilterKey, mockUserAccountEntity, mockUserFilters, UserAccountEntity,
} from '@/entities/user-account';
import { ActionContext } from 'vuex';
import { IUserAccountEntityState } from './userAccountEntity.types';
import { UserAccountEntityModule } from './userAccountEntity';

const service = new UserAccountsService(httpClient);
const module = new UserAccountEntityModule(service);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: null,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IUserAccountEntityState, IUserAccountEntityState>;

describe('User account entity module', () => {
  describe('actions', () => {
    describe('genericFilterAction', () => {
      it('should the proper method from the service with a filter as parameter and commit the result', async () => {
        const filter = mockUserFilters()[0];
        const res = mockUserAccountEntity();
        module.service.addFilter = jest.fn(() => Promise.resolve(res));
        await module.actions.genericFilterAction(actionContext, { payload: filter, methodName: 'addFilter' });
        expect(module.service.addFilter).toBeCalledWith(filter);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('addFilter', () => {
      it('should call genericFilterAction with proper parameters', async () => {
        const filter = mockUserFilters()[0];
        await module.actions.addFilter(actionContext, filter);
        expect(actionContext.dispatch).toBeCalledWith('genericFilterAction', { payload: filter, methodName: 'addFilter' });
      });
    });

    describe('editFilter', () => {
      it('should call genericFilterAction with proper parameters', async () => {
        const oldFilter = mockUserFilters()[0];
        const newFilter = mockUserFilters()[0];
        const payload = {
          oldFilter,
          newFilter,
        };
        await module.actions.editFilter(actionContext, payload);
        expect(actionContext.dispatch).toBeCalledWith('genericFilterAction', { payload, methodName: 'editFilter' });
      });
    });

    describe('deleteFilter', () => {
      it('should call genericFilterAction with proper parameters', async () => {
        const filter = mockUserFilters()[0];
        await module.actions.deleteFilter(actionContext, filter);
        expect(actionContext.dispatch).toBeCalledWith('genericFilterAction', { payload: filter, methodName: 'deleteFilter' });
      });
    });

    describe('assignRole', () => {
      it('should call service assignRole with proper parameters and commit the result', async () => {
        const payload = {
          subRole: {},
          userId: '123',
        } as IAddRoleToUserRequest;
        const res = mockUserAccountEntity();
        module.service.assignRole = jest.fn(() => Promise.resolve(res));

        await module.actions.assignRole(actionContext, payload);

        expect(module.service.assignRole).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('setUserPreferredLanguage', () => {
      it('should call service setUserPreferredLanguage with proper parameters and commit the result', async () => {
        const payload = {
          id: '123',
          languageCode: 'fr',
        };
        const res = mockUserAccountEntity();
        module.service.setUserPreferredLanguage = jest.fn(() => Promise.resolve(res));

        await module.actions.setUserPreferredLanguage(actionContext, payload);

        expect(module.service.setUserPreferredLanguage).toBeCalledWith(payload.id, payload.languageCode);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('setCurrentUserPreferredLanguage', () => {
      it('should call service setCurrentUserPreferredLanguage with proper parameters and commit the result', async () => {
        const payload = 'fr';

        const res = mockUserAccountEntity();
        module.service.setCurrentUserPreferredLanguage = jest.fn(() => Promise.resolve(res));

        await module.actions.setCurrentUserPreferredLanguage(actionContext, payload);

        expect(module.service.setCurrentUserPreferredLanguage).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('fetchCurrentUserAccount', () => {
      it('should call service fetchCurrentUserAccount and commit the result', async () => {
        const res = mockUserAccountEntity();
        module.service.fetchCurrentUserAccount = jest.fn(() => Promise.resolve(res));

        await module.actions.fetchCurrentUserAccount(actionContext);

        expect(module.service.fetchCurrentUserAccount).toBeCalledTimes(1);
        expect(actionContext.commit).toBeCalledWith('setCurrentUserAccount', res);
      });
    });
  });

  describe('getters', () => {
    describe('currentUserFiltersByKey', () => {
      it('returns the correct parsed filters', () => {
        module.mutations.setCurrentUserAccount(module.state, mockUserAccountEntity());
        const key = FilterKey.CaseFiles;
        const res = module.getters.currentUserFiltersByKey()(key);
        const userAccount = new UserAccountEntity(mockUserAccountEntity());
        expect(res).toEqual([userAccount.filters[2]]);
      });
    });
  });

  describe('mutations', () => {
    describe('setCurrentUserAccount', () => {
      it('should set currentUserAccount', () => {
        const entity = mockUserAccountEntity();
        module.mutations.setCurrentUserAccount(module.state, entity);
        expect(module.state.currentUserAccount).toEqual(entity);
      });
    });
  });
});
