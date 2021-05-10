import { IAllUserData, IRolesData, IAppUserData } from '@/entities/app-user';

export interface IStorage {

  mutations: {
    invalidateAppUserCache(): void;
  },

  getters: {
    appUsersWithInfo(): IAppUserData[];
    appUserWhere(key: string, value: string): IAppUserData;
    searchAppUser(searchTerm: string, searchAll?: boolean, searchAmong?: Array<string>): IAppUserData[];
  }
  actions: {
    fetchAllUsers(): Promise<IAllUserData[]>;
    fetchAppUsers(): Promise<IAppUserData[]>;
    fetchRoles(): Promise<IRolesData[]>;
  }
}

export interface IStorageMock {

  mutations: {
    invalidateAppUserCache(): jest.Mock<void>;
  },

  getters: {
    appUsersWithInfo: jest.Mock<void>;
    appUserWhere: jest.Mock<void>;
    searchAppUser: jest.Mock<void>;
  },

  actions: {
    fetchAllUsers: jest.Mock<void>;
    fetchAppUsers: jest.Mock<void>;
    fetchRoles: jest.Mock<void>;
    findAppUsers: jest.Mock<void>;
  },
}
