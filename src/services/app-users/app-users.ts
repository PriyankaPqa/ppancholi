import { IHttpClient } from '@/services/httpClient';
import {
  IAllUserData, IRolesData, IAppUserAzureData, IAppUserData,
} from '@/entities/app-user';
import { IAppUsersService } from './app-users.types';

export class AppUsersService implements IAppUsersService {
  constructor(private readonly http: IHttpClient) {}

  async fetchAllUsers(): Promise<IAllUserData[]> {
    const params = {
      top: 999,
      select: ['id', 'mobilePhone', 'businessPhones', 'mail'],
    };
    return this.http.get('/Graph/users', { params, isOData: true });
  }

  async fetchAppUsers(): Promise<IAppUserAzureData[]> {
    return this.http.get('/Graph/app-users');
  }

  async fetchRoles(): Promise<IRolesData[]> {
    return this.http.get('/Graph/roles');
  }

  async findAppUsers(searchTerm: string): Promise<IAppUserData[]> {
    const params = {
      select: ['id', 'displayName', 'mail'],
      filter: [`startsWith('${searchTerm}', surname) or startsWith('${searchTerm}', `
        + `givenName) or startsWith('${searchTerm}', displayName) or startsWith('${searchTerm}', Mail)`],
    };
    return this.http.get('/Graph/users', { params, isOData: true });
  }
}
