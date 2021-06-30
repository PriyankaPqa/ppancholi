import { IHttpClient } from '../httpClient';
import { IEntity } from '../../entities/base/base.types';
import { IAzureSearchParams } from '../../types';
import { IAzureCombinedSearchResult } from '../../types/interfaces/IAzureSearchResult';
import { IDomainBaseService } from './base.types';

export class DomainBaseService<T extends IEntity> implements IDomainBaseService<T> {
  baseUrl: string;

  baseApi: string;

  controller: string;

  constructor(protected readonly http: IHttpClient, apiUrlSuffix: string, controller: string) {
    this.baseApi = `${apiUrlSuffix}`;
    this.baseUrl = `${apiUrlSuffix}/${controller}`;
    this.controller = controller;
  }

  async get(id: uuid): Promise<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  async getAll(): Promise<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}`);
  }

  async getAllIncludingInactive(): Promise<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/all`);
  }

  async activate(id: uuid): Promise<T> {
    return this.http.patch<T>(`${this.baseUrl}/${id}/active`);
  }

  async deactivate(id: uuid): Promise<T> {
    return this.http.delete<T>(`${this.baseUrl}/${id}`);
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null): Promise<IAzureCombinedSearchResult<T, unknown>> {
    return this.http.get(`search/${searchEndpoint ?? this.controller}`, { params, isOData: true });
  }
}
