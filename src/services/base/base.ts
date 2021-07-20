import { IHttpClient } from '@/services/httpClient';
import { IEntity } from '@/entities/base/base.types';
import { IAzureSearchParams } from '@/types';
import { IAzureCombinedSearchResult } from '@/types/interfaces/IAzureSearchResult';
import { IDomainBaseService } from './base.types';

export class DomainBaseService<T extends IEntity, IdParams> implements IDomainBaseService<T, IdParams> {
  baseUrl: string;

  baseApi: string;

  controller: string;

  constructor(protected readonly http: IHttpClient, apiUrlSuffix: string, controller: string) {
    this.baseApi = `${process.env.VUE_APP_API_BASE_URL}/${controller}`;
    this.baseUrl = `${process.env.VUE_APP_API_BASE_URL}/${apiUrlSuffix}/${controller}`;
    this.controller = controller;
  }

  async get(id: IdParams, useGlobalHandler = true): Promise<T> {
    return this.http.get<T>(this.getItemUrl(`${this.baseUrl}/{id}`, id), { globalHandler: useGlobalHandler });
  }

  async getAll(): Promise<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}`);
  }

  async getAllIncludingInactive(): Promise<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/all`);
  }

  async activate(id: IdParams): Promise<T> {
    return this.http.patch<T>(`${this.getItemUrl(`${this.baseUrl}/{id}`, id)}/active`);
  }

  async deactivate(id: IdParams): Promise<T> {
    return this.http.delete<T>(this.getItemUrl(`${this.baseUrl}/{id}`, id));
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null): Promise<IAzureCombinedSearchResult<T, unknown>> {
    return this.http.get(`search/${searchEndpoint ?? this.controller}`, { params, isOData: true });
  }

  // if necessary overwrite this for your url
  // in the case of a url like /case-files/{caseFileId}/referrals/{id}
  // idParams would be { caseFileId: 'xxx', id: 'yyy' }
  // for simple {id} in the url (no hierarchy) you can simply use a string
  protected getItemUrl(url: string, idParams: IdParams) : string {
    if (typeof idParams === 'object') {
      let url2 = url;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line
      for (const [key, value] of Object.entries(idParams)) {
        url2 = url2.replace(`{${key}}`, value);
      }
      return url2;
    }
    return url.replace('{id}', idParams.toString());
  }
}
