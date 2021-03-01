import { IHttpClient } from '@/services/httpClient';
import {
  IAllUserData, IRolesData, IAppUserAzureData,
} from '@/entities/app-user';
import { IAppUsersService } from './app-users.types';

export class AppUsersService implements IAppUsersService {
  constructor(private readonly http: IHttpClient) {}

  async fetchAllUsers(): Promise<IAllUserData[]> {
    return this.http.get('/Graph/users');
  }

  async fetchAppUsers(): Promise<IAppUserAzureData[]> {
    return this.http.get('/Graph/app-users');
  }

  async fetchRoles(): Promise<IRolesData[]> {
    return this.http.get('/Graph/roles');
  }
}
