import {
  IUserAccount, IUserAccountSearchData,
} from '@/entities/user-account';
import { IAddRoleToUserRequest } from '@/services/user-accounts';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    userAccountById(id: uuid): IUserAccount;
    searchUserAccounts(search: string, searchAmong: string[]): IUserAccountSearchData[];
  }

  actions: {
    fetchUserAccount(id: uuid): Promise<IUserAccount>;
    addRoleToUser(role:IAddRoleToUserRequest): Promise<IUserAccount>;
    searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccount>>;
  }
}

export interface IStorageMock {
  getters: {
    userAccountById: jest.Mock<void>;
    searchUserAccounts: jest.Mock<void>;
  }

  actions: {
    fetchUserAccount: jest.Mock<void>;
    addRoleToUser: jest.Mock<void>;
    searchUserAccounts: jest.Mock<void>;
  }
}
