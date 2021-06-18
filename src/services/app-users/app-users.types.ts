import {
  IAppUserData,
} from '@/entities/app-user';

export interface IAppUsersService {
  findAppUsers(searchTerm:string): Promise<IAppUserData[]>;
}

export interface IAppUsersServiceMock {
  findAppUsers: jest.Mock <IAppUserData[]>;
}
