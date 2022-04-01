/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@libs/core-lib/services/http-client';
import {
  IFilter, IUserAccountEntity,
} from '@/entities/user-account';
import { DomainBaseService } from '@/services/base';

import {
  IUserAccountsService, IAddRoleToUserRequest, IEditFilterRequest,
} from './user-accounts.types';

const API_URL_SUFFIX = 'user-account';
const CONTROLLER = 'user-accounts';

export class UserAccountsService extends DomainBaseService<IUserAccountEntity, uuid> implements IUserAccountsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async fetchCurrentUserAccount(): Promise<IUserAccountEntity> {
    return this.http.get(`${this.baseUrl}/current-user`, { globalHandler: false });
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

  async assignRole(payload: IAddRoleToUserRequest): Promise<IUserAccountEntity> {
    return this.http.post<IUserAccountEntity>(`${this.baseUrl}/${payload.userId}/role`, { roleId: payload.subRole.id });
  }
}
