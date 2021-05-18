import { IAddRoleToUserRequest } from '@/services/user-accounts';
import { IStore, IState } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IUserAccount, IUserAccountSearchData } from '../../../entities/user-account/user-account.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    userAccountById(id: uuid): IUserAccount {
      return store.getters['userAccount/userAccountById'](id);
    },

    searchUserAccounts(search: string, searchAmong: string[]): IUserAccountSearchData[] {
      return store.getters['userAccount/searchUserAccounts'](search, searchAmong);
    },
  },

  actions: {
    fetchUserAccount(id: uuid): Promise<IUserAccount> {
      return store.dispatch('userAccount/fetchUserAccount', id);
    },

    addRoleToUser(role:IAddRoleToUserRequest): Promise<IUserAccount> {
      return store.dispatch('userAccount/addRoleToUser', role);
    },

    searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccount>> {
      return store.dispatch('userAccount/searchUserAccounts', params);
    },
  },
});
