import _sortBy from 'lodash/sortBy';
import { ActionContext } from 'vuex';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserAccountsService, IAddRoleToUserRequest } from '@/services/user-accounts/entity';
import {
  FilterKey, mockUserAccountEntity, mockUserFilters, UserAccountEntity,
} from '@libs/entities-lib/user-account';
import { OptionItemsService } from '@/services/optionItems';
import { OptionItem } from '@libs/entities-lib/optionItem';
import { httpClient } from '@/services/httpClient';
import { IUserAccountEntityState } from './userAccountEntity.types';
import { UserAccountEntityModule } from './userAccountEntity';
import { mockOptionItems } from '../../../../../../libs/entities-lib/src/optionItem/optionItem.mock';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const signalR = mockSignalR();

const service = new UserAccountsService(httpClient);
const optionsService = new OptionItemsService(httpClient);
const myModule = new UserAccountEntityModule(service, optionsService, signalR);

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
        myModule.service.addFilter = jest.fn(() => Promise.resolve(res));
        await myModule.actions.genericFilterAction(actionContext, { payload: filter, methodName: 'addFilter' });
        expect(myModule.service.addFilter).toBeCalledWith(filter);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('addFilter', () => {
      it('should call genericFilterAction with proper parameters', async () => {
        const filter = mockUserFilters()[0];
        await myModule.actions.addFilter(actionContext, filter);
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
        await myModule.actions.editFilter(actionContext, payload);
        expect(actionContext.dispatch).toBeCalledWith('genericFilterAction', { payload, methodName: 'editFilter' });
      });
    });

    describe('deleteFilter', () => {
      it('should call genericFilterAction with proper parameters', async () => {
        const filter = mockUserFilters()[0];
        await myModule.actions.deleteFilter(actionContext, filter);
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
        myModule.service.assignRole = jest.fn(() => Promise.resolve(res));

        await myModule.actions.assignRole(actionContext, payload);

        expect(myModule.service.assignRole).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('fetchCurrentUserAccount', () => {
      it('should call service fetchCurrentUserAccount and commit the result', async () => {
        const res = mockUserAccountEntity();
        myModule.service.fetchCurrentUserAccount = jest.fn(() => Promise.resolve(res));

        await myModule.actions.fetchCurrentUserAccount(actionContext);

        expect(myModule.service.fetchCurrentUserAccount).toBeCalledTimes(1);
        expect(actionContext.commit).toBeCalledWith('setCurrentUserAccount', res);
      });
    });

    describe('fetchRoles', () => {
      it('should call option service getOptionList and commit the result', async () => {
        const res = mockOptionItems();
        myModule.optionsService.getOptionList = jest.fn(() => Promise.resolve(res));

        await myModule.actions.fetchRoles(actionContext);

        expect(myModule.optionsService.getOptionList).toBeCalledTimes(1);
        expect(actionContext.commit).toBeCalledWith('setRoles', res);
      });
    });
  });

  describe('getters', () => {
    describe('currentUserFiltersByKey', () => {
      it('returns the correct parsed filters', () => {
        myModule.mutations.setCurrentUserAccount(myModule.state, mockUserAccountEntity());
        const key = FilterKey.CaseFiles;
        const res = myModule.getters.currentUserFiltersByKey(myModule.state)(key);
        const userAccount = new UserAccountEntity(mockUserAccountEntity());
        expect(res).toEqual([userAccount.filters[2]]);
      });
    });

    describe('roles', () => {
      it('returns the roles list', () => {
        myModule.mutations.setRoles(myModule.state, mockOptionItems());
        const res = myModule.getters.roles(myModule.state);
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
        myModule.mutations.setCurrentUserAccount(myModule.state, entity);
        expect(myModule.state.currentUserAccount).toEqual(entity);
      });
    });

    describe('setRoles', () => {
      it('should set roles', () => {
        const roles = mockOptionItems();
        myModule.mutations.setRoles(myModule.state, roles);
        expect(myModule.state.roles).toEqual(roles);
      });
    });

    describe('setRolesFetched', () => {
      it('should set rolesFetched', () => {
        myModule.mutations.setRolesFetched(myModule.state, true);
        expect(myModule.state.rolesFetched).toEqual(true);
      });
    });
  });
});
