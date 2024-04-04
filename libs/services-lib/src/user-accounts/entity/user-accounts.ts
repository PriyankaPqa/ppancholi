/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IFilter, IUserAccountEntity, IUserAccountMetadata, IUserProfileQueryResponse,
} from '@libs/entities-lib/user-account';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { GlobalHandler, IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';

import {
  IUserAccountsService, IAddRoleToUserRequest, IEditFilterRequest, ICreateUserRequest,
} from './user-accounts.types';

const API_URL_SUFFIX = 'user-account';
const CONTROLLER = 'user-accounts';

export class UserAccountsService extends DomainBaseService<IUserAccountEntity, uuid> implements IUserAccountsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async fetchCurrentUserAccount(): Promise<IUserAccountEntity> {
    return this.http.get(`${this.baseUrl}/current-user`, { globalHandler: GlobalHandler.Partial });
  }

  async addFilter(filter: IFilter): Promise<IUserAccountEntity> {
    return this.http.post<IUserAccountEntity>(`${this.baseUrl}/filter`, {
      ...filter,
      criteria: filter.criteria.map((c) => JSON.stringify(c)),
    });
  }

  async editFilter(payload: IEditFilterRequest): Promise<IUserAccountEntity> {
    return this.http.patch<IUserAccountEntity>(`${this.baseUrl}/filter`, {
      oldFilter: {
        ...payload.oldFilter,
        criteria: payload.oldFilter.criteria.map((c) => JSON.stringify(c)),
      },
      newFilter: {
        ...payload.newFilter,
        criteria: payload.newFilter.criteria.map((c) => JSON.stringify(c)),
      },
    });
  }

  async deleteFilter(filter: IFilter): Promise<IUserAccountEntity> {
    return this.http.delete<IUserAccountEntity>(`${this.baseUrl}/filter`, {
      data: {
        deleteFilter: {
          ...filter,
          criteria: filter.criteria.map((c) => JSON.stringify(c)),
        },
      },
    });
  }

  async createUserAccount(payload: ICreateUserRequest): Promise<IUserAccountEntity> {
    return this.http.post<IUserAccountEntity>(`${this.baseUrl}/user`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async assignRole(payload: IAddRoleToUserRequest): Promise<IUserAccountEntity> {
    return this.http.post<IUserAccountEntity>(`${this.baseUrl}/${payload.userId}/role`, { roleId: payload.subRole.id });
  }

  async fetchByEventAndRole(targetEvent: uuid, targetRoles: Array<uuid>): Promise<IUserAccountMetadata[]> {
    return this.http.get(`${this.baseUrl}/users-by-event-role?eventId=${targetEvent}&roleIds=${(targetRoles || []).join('&roleIds=')}`);
  }

  async search(params: IAzureSearchParams): Promise<IAzureCombinedSearchResult<IUserAccountEntity, unknown>> {
    return this.http.get(`${API_URL_SUFFIX}/search/user-accountsV2`, { params, isOData: true });
  }

  async searchDirectoryUsers(searchTerm: string): Promise<IUserProfileQueryResponse[]> {
    return this.http.get(`${API_URL_SUFFIX}/search/directory-users?searchTerm=${searchTerm}`);
  }
}
