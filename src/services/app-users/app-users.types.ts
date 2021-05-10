import {
  IAllUserData,
  IAppUserAzureData,
  IRolesData,
  IAppUserData,
} from '@/entities/app-user';

export interface IAppUsersService {
  fetchAllUsers(): Promise<IAllUserData[]>;
  fetchAppUsers(): Promise<IAppUserAzureData[]>;
  fetchRoles(): Promise<IRolesData[]>;
  findAppUsers(searchTerm:string): Promise<IAppUserData[]>;
}

export interface IAppUsersServiceMock {
  fetchAllUsers: jest.Mock <IAllUserData[]>;
  fetchAppUsers: jest.Mock <IAppUserAzureData[]>;
  fetchRoles: jest.Mock <IRolesData[]>;
  findAppUsers: jest.Mock <IAppUserData[]>;
}
