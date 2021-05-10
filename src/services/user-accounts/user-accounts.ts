/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IUserAccountData, IUserAccountSearchData } from '@/entities/user-account';
import { IUserAccountsService, IAddRoleToUserRequest } from './user-accounts.types';

export class UserAccountsService implements IUserAccountsService {
  constructor(private readonly http: IHttpClient) {}

  async searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccountSearchData>> {
    const data: IAzureSearchResult<IUserAccountSearchData> = await this.http.get('/search/user-account-projections', { params, isOData: true });
    if (data && data.value) {
      data.value = data.value.map((user) => this.getUserWithParsedFilterCriteria(user));
    }
    return data;
  }

  async addRoleToUser(payload: IAddRoleToUserRequest): Promise<IUserAccountData> {
    const data = await this.http.post(`user-account/user-accounts/${payload.userId}/role`, { roleId: payload.roleId });
    return this.getUserWithParsedFilterCriteria(data);
  }

  private getUserWithParsedFilterCriteria(user: any) {
    if (user) {
      return {
        ...user,
        filters: user.filters.map((f: any) => ({
          ...f,
          criteria: f.criteria.map((c: any) => JSON.parse(c)),
        })),
      };
    }
    return null;
  }
}
