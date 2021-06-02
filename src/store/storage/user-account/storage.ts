import { IAddRoleToUserRequest } from '@/services/user-accounts';
import { IStore, IState } from '@/store/store.types';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IUserAccount, IUserAccountSearchData } from '../../../entities/user-account/user-account.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    userAccounts(): IUserAccount[] {
      return store.getters['userAccount/userAccounts']();
    },

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

    fetchAllUserAccounts(): Promise<IUserAccount[]> {
      return store.dispatch('userAccount/fetchAllUserAccounts');
    },

    addRoleToUser(role:IAddRoleToUserRequest): Promise<IUserAccount> {
      return store.dispatch('userAccount/addRoleToUser', role);
    },

    deleteUserAccount(userId:string):void {
      store.dispatch('userAccount/deleteUserAccount', userId);
    },

    searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccount>> {
      return store.dispatch('userAccount/searchUserAccounts', params);
    },
  },
});
