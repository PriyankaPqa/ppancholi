/**
 * @group store
 */

import _sortBy from 'lodash/sortBy';
import { ActionContext } from 'vuex';
import { mockOptionItems } from '../../../entities/optionItem/optionItem.mock';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAccountsService, IAddRoleToUserRequest } from '@/services/user-accounts/entity';
import { httpClient } from '@/services/httpClient';
import {
  FilterKey, mockUserAccountEntity, mockUserFilters, UserAccountEntity,
} from '@/entities/user-account';
import { IUserAccountEntityState } from './userAccountEntity.types';
import { UserAccountEntityModule } from './userAccountEntity';
import { OptionItemsService } from '@/services/optionItems';
import { OptionItem } from '@/entities/optionItem';

const service = new UserAccountsService(httpClient);
const optionsService = new OptionItemsService(httpClient);
const module = new UserAccountEntityModule(service, optionsService);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IUserAccountEntityState,
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

    describe('fetchCurrentUserAccount', () => {
      it('should call service fetchCurrentUserAccount and commit the result', async () => {
        const res = mockUserAccountEntity();
        module.service.fetchCurrentUserAccount = jest.fn(() => Promise.resolve(res));

        await module.actions.fetchCurrentUserAccount(actionContext);

        expect(module.service.fetchCurrentUserAccount).toBeCalledTimes(1);
        expect(actionContext.commit).toBeCalledWith('setCurrentUserAccount', res);
      });
    });

    describe('fetchRoles', () => {
      it('should call option service getOptionList and commit the result', async () => {
        const res = mockOptionItems();
        module.optionsService.getOptionList = jest.fn(() => Promise.resolve(res));

        await module.actions.fetchRoles(actionContext);

        expect(module.optionsService.getOptionList).toBeCalledTimes(1);
        expect(actionContext.commit).toBeCalledWith('setRoles', res);
      });
    });
  });

  describe('getters', () => {
    describe('currentUserFiltersByKey', () => {
      it('returns the correct parsed filters', () => {
        module.mutations.setCurrentUserAccount(module.state, mockUserAccountEntity());
        const key = FilterKey.CaseFiles;
        const res = module.getters.currentUserFiltersByKey(module.state)(key);
        const userAccount = new UserAccountEntity(mockUserAccountEntity());
        expect(res).toEqual([userAccount.filters[2]]);
      });
    });

    describe('roles', () => {
      it('returns the roles list', () => {
        module.mutations.setRoles(module.state, mockOptionItems());
        const res = module.getters.roles(module.state);
        expect(res).toEqual(_sortBy(
          mockOptionItems().map((e) => new OptionItem(e)),
          'orderRank',
        ));
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

    describe('setRoles', () => {
      it('should set roles', () => {
        const roles = mockOptionItems();
        module.mutations.setRoles(module.state, roles);
        expect(module.state.roles).toEqual(roles);
      });
    });

    describe('setRolesFetched', () => {
      it('should set rolesFetched', () => {
        module.mutations.setRolesFetched(module.state, true);
        expect(module.state.rolesFetched).toEqual(true);
      });
    });
  });
});
