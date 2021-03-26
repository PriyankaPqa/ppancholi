import {
  EFilterKey, IFilter, IUser, IUserData,
} from '@/entities/user';

export interface IStorage {
  getters: {
    user(): IUser;
    landingPage(): string;
    filtersByKey(key: EFilterKey): IFilter[];
  }

  mutations: {
    setUser(payload: IUserData): void;
    setFilters(payload: Array<IFilter>): void;
  }

  actions: {
    signOut(): void;
    fetchUserData(): void;
  }
}

export interface IStorageMock {
  getters: {
    user: jest.Mock<void>
    landingPage: jest.Mock<void>
    filtersByKey: jest.Mock<void>
  }

  mutations: {
    setUser: jest.Mock<void>
    setFilters: jest.Mock<void>
  }

  actions: {
    signOut: jest.Mock<void>
    fetchUserData: jest.Mock<void>
  }
}
