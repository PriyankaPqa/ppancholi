import {
  IAppUserData,
} from '@libs/entities-lib/app-user';

export interface IAppUsersService {
  findAppUsers(searchTerm:string): Promise<IAppUserData[]>;
}

export interface IAppUsersServiceMock {
  findAppUsers: jest.Mock <IAppUserData[]>;
}
