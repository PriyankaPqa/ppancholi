/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@/services/httpClient';
import { IUserAccountData, IFilter } from '@/entities/user';
import { IUsersService, IEditFilterRequest, IDeleteFilterRequest } from './users.types';

export class UsersService implements IUsersService {
  constructor(private readonly http: IHttpClient) {}

  async fetchUser(): Promise<IUserAccountData> {
    const data: any = await this.http.get('user-account/user-accounts/current-user');

    return this.getUserWithParsedFilterCriteria(data);
  }

  async createFilter(filter: IFilter): Promise<IUserAccountData> {
    const data = await this.http.post('user-account/user-accounts/filter', {
      ...filter,
      criteria: filter.criteria.map((c) => JSON.stringify(c)),
    });

    return this.getUserWithParsedFilterCriteria(data);
  }

  async updateFilter(payload: IEditFilterRequest): Promise<IUserAccountData> {
    const data = await this.http.patch('user-account/user-accounts/filter', {
      oldFilter: {
        ...payload.oldFilter,
        criteria: payload.oldFilter.criteria.map((c) => JSON.stringify(c)),
      },
      newFilter: {
        ...payload.newFilter,
        criteria: payload.newFilter.criteria.map((c) => JSON.stringify(c)),
      },
    });

    return this.getUserWithParsedFilterCriteria(data);
  }

  async removeFilter(payload: IDeleteFilterRequest): Promise<IUserAccountData> {
    const data = await this.http.delete('user-account/user-accounts/filter', {
      data: {
        deleteFilter: {
          ...payload.deleteFilter,
          criteria: payload.deleteFilter.criteria.map((c) => JSON.stringify(c)),
        },
      },
    });

    return this.getUserWithParsedFilterCriteria(data);
  }

  private getUserWithParsedFilterCriteria(user: any): IUserAccountData {
    if (user) {
      return {
        ...user,
        filters: user.filters.map((f: any) => ({
          ...f,
          criteria: f.criteria.map((c: any) => JSON.parse(c)),
        })),
      } as IUserAccountData;
    }

    return null;
  }
}
