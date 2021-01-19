import { IUser, IUserData } from '@/entities/user';

export interface IStorage {
  getters: {
    user(): IUser;
  }

  mutations: {
    setUser(payload: IUserData): void;
  }

  actions: {
    signOut(): void;
    fetchUserData(): void;
  }
}

export interface IStorageMock {
  getters: {
    user: jest.Mock<void>
  }

  mutations: {
    setUser: jest.Mock<void>
  }

  actions: {
    signOut: jest.Mock<void>
    fetchUserData: jest.Mock<void>
  }
}
