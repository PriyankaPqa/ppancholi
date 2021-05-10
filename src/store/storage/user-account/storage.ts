import { IAddRoleToUserRequest } from '@/services/user-accounts';
import { IStore, IState } from '@/store/store.types';
import { IUserAccount } from '../../../entities/user-account/user-account.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  getters: {
    userAccountById(id: uuid): IUserAccount {
      return store.getters['userAccount/userAccountById'](id);
    },
  },

  actions: {
    fetchUserAccount(id: uuid): Promise<IUserAccount> {
      return store.dispatch('userAccount/fetchUserAccount', id);
    },

    addRoleToUser(role:IAddRoleToUserRequest): Promise<IUserAccount> {
      return store.dispatch('userAccount/addRoleToUser', role);
    },
  },
});
