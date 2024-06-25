import { IEntity } from '@libs/entities-lib/base';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/types';
import { GlobalHandler, IHttpClient, IRestResponse } from '../http-client';
import { IDomainBaseService } from './base.types';

export class DomainBaseService<T extends IEntity, IdParams> implements IDomainBaseService<T, IdParams> {
  baseUrl: string;

  baseApi: string;

  controller: string;

  apiUrlSuffix: string;

  constructor(protected readonly http: IHttpClient, apiUrlSuffix: string, controller: string) {
    this.baseApi = `${http.baseUrl}/${apiUrlSuffix}`;
    this.baseUrl = `${http.baseUrl}/${apiUrlSuffix}/${controller}`;
    this.controller = controller;
    this.apiUrlSuffix = apiUrlSuffix;
  }

  /**
   *
   * @param idParams can be a string (the id) or an object (ex: {caseFileId: string, id: string}; used for sub-entities such as case notes or case filer referrals)
   * @param useGlobalHandler parameter for using the global handler. Can be Disabled or Partial for cases where no notification should be displayed even if
   * no entity is returned, such as case file metadata for a newly created case file
   * @returns call response
   */
  async get(idParams: IdParams, useGlobalHandler = GlobalHandler.Enabled): Promise<T> {
    return this.http.get<T>(this.getItemUrl(`${this.baseUrl}/{id}`, idParams), { globalHandler: useGlobalHandler });
  }

  /**
   *
   * @param idParams
   * @param useGlobalHandler
   */
  async getFullResponse(idParams: IdParams, useGlobalHandler = GlobalHandler.Enabled): Promise<IRestResponse<T>> {
    return this.http.getFullResponse<T>(this.getItemUrl(`${this.baseUrl}/{id}`, idParams), { globalHandler: useGlobalHandler });
  }

  /**
   *
   * @param parentId is not passed for entities. It is the parent id for sub-entities (ex. case notes, case file referrals), and the call fetches all sub-entities
   * of the parent entity (ex. case file) with the passed parentId
   * @returns call response
   */
  async getAll(parentId?: Omit<IdParams, 'id'>): Promise<T[]> {
    return this.http.get<T[]>(this.getItemUrl(`${this.baseUrl}`, parentId));
  }

  async getAllIncludingInactive(parentId?: Omit<IdParams, 'id'>): Promise<T[]> {
    return this.http.get<T[]>(this.getItemUrl(`${this.baseUrl}/all`, parentId));
  }

  async getByIds(ids: uuid[]): Promise<T[]> {
    return this.http.get<T[]>(`${this.getItemUrl(`${this.baseUrl}`, null)}`, {
      params: {
        ids,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
  }

  async activate(idParams: IdParams): Promise<T> {
    return this.http.patch<T>(`${this.getItemUrl(`${this.baseUrl}/{id}`, idParams)}/active`);
  }

  async deactivate(idParams: IdParams): Promise<T> {
    return this.http.delete<T>(this.getItemUrl(`${this.baseUrl}/{id}`, idParams));
  }

  async search(params: ISearchParams, searchEndpoint: string = null): Promise<ICombinedSearchResult<T, unknown>> {
    return this.http.get(`${this.apiUrlSuffix}/search/${searchEndpoint ?? this.controller}`, { params, isOData: true });
  }

  /**
 * @param url
 * @param idParams (string or object} Ex: { caseFileId: 'xxx', id: 'yyy' }
 * If an object is passed, will replaced all {caseFileId}/{id} in the URL
 * If a string is passed, will replaced only the {id}
 */
  protected getItemUrl(url: string, idParams: IdParams | Omit<IdParams, 'id'>) : string {
    if (!idParams) {
      return url;
    }
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
