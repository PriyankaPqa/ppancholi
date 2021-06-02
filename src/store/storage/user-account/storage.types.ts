import {
  IUserAccount, IUserAccountSearchData,
} from '@/entities/user-account';
import { IAddRoleToUserRequest } from '@/services/user-accounts';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IStorage {
  getters: {
    userAccounts(): IUserAccount[];
    userAccountById(id: uuid): IUserAccount;
    searchUserAccounts(search: string, searchAmong: string[]): IUserAccountSearchData[];
  }

  actions: {
    fetchUserAccount(id: uuid): Promise<IUserAccount>;
    fetchAllUserAccounts(): Promise<IUserAccount[]>;
    addRoleToUser(role: IAddRoleToUserRequest): Promise<IUserAccount>;
    deleteUserAccount(userId: string): void;
    searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccount>>;
  }
}

export interface IStorageMock {
  getters: {
    userAccounts: jest.Mock<void>;
    userAccountById: jest.Mock<void>;
    searchUserAccounts: jest.Mock<void>;
  }

  actions: {
    fetchUserAccount: jest.Mock<void>;
    fetchAllUserAccounts: jest.Mock<void>;
    addRoleToUser: jest.Mock<void>;
    deleteUserAccount: jest.Mock<void>;
    searchUserAccounts: jest.Mock<void>;
  }
}
