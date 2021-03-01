import { IAllUserData, IRolesData, IAppUserData } from '@/entities/app-user';

export interface IStorage {
  getters: {
    appUsersWithInfo(): IAppUserData[];
    appUserWhere(key: string, value: string): IAppUserData;
  }
  actions: {
    fetchAllUsers(): Promise<IAllUserData[]>;
    fetchAppUsers(): Promise<IAppUserData[]>;
    fetchRoles(): Promise<IRolesData[]>;
  }
}

export interface IStorageMock {
  getters: {
    appUsersWithInfo: jest.Mock<void>
    appUserWhere: jest.Mock<void>
  }
  actions: {
    fetchAllUsers: jest.Mock<void>
    fetchAppUsers: jest.Mock<void>
    fetchRoles: jest.Mock<void>
  }
}
