import {
  IAllUserData, IAppUserAzureData, IRolesData,
} from '@/entities/app-user';

export interface IAppUsersService {
  fetchAllUsers(): Promise<IAllUserData[]>;
  fetchAppUsers(): Promise<IAppUserAzureData[]>;
  fetchRoles(): Promise<IRolesData[]>;
}

export interface IAppUsersServiceMock {
  fetchAllUsers: jest.Mock <IAllUserData[]>;
  fetchAppUsers: jest.Mock <IAppUserAzureData[]>;
  fetchRoles: jest.Mock <IRolesData[]>;
}
