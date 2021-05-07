import {
  IUserAccount,
} from '@/entities/user-account';

export interface IStorage {
  getters: {
    userAccountById(id: uuid): IUserAccount;
  }

  actions: {
    fetchUserAccount(id: uuid): Promise<IUserAccount>;
  }
}

export interface IStorageMock {
  getters: {
    userAccountById: jest.Mock<void>
  }

  actions: {
    fetchUserAccount: jest.Mock<void>
  }
}
