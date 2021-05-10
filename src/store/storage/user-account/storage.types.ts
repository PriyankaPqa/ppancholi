import {
  IUserAccount,
} from '@/entities/user-account';
import { IAddRoleToUserRequest } from '@/services/user-accounts';

export interface IStorage {
  getters: {
    userAccountById(id: uuid): IUserAccount;
  }

  actions: {
    fetchUserAccount(id: uuid): Promise<IUserAccount>;
    addRoleToUser(role:IAddRoleToUserRequest): Promise<IUserAccount>;
  }
}

export interface IStorageMock {
  getters: {
    userAccountById: jest.Mock<void>;
  }

  actions: {
    fetchUserAccount: jest.Mock<void>;
    addRoleToUser: jest.Mock<void>;
  }
}
