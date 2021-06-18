import { IHttpClient } from '@/services/httpClient';
import { IEntity } from '@/entities/base/base.types';
import { IDomainBaseService } from './base.types';

export class DomainBaseService<T extends IEntity> implements IDomainBaseService<T> {
  baseUrl: string;

  constructor(protected readonly http: IHttpClient, apiUrlSuffix: string, controller: string) {
    this.baseUrl = `${process.env.VUE_APP_API_BASE_URL}/${apiUrlSuffix}/${controller}`;
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
}
