import { IAllUserData, IRolesData, IAppUserData } from '@/entities/app-user';
import { IAppUserAzureData } from '../../../entities/app-user/app-user.types';

export interface IStorage {
  getters: {
    appUsersWithInfo(): IAppUserData[];
    appUserWhere(key: string, value: string): IAppUserData;
    appUserWithNameContaining(searchTerm: string): IAppUserAzureData[];
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
    appUserWithNameContaining: jest.Mock<void>
  }
  actions: {
    fetchAllUsers: jest.Mock<void>
    fetchAppUsers: jest.Mock<void>
    fetchRoles: jest.Mock<void>
  }
}
