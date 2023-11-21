/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IPowerBiTokenDetails,
  IQuery, QueryType,
} from '@libs/entities-lib/reporting';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';

import {
  IQueriesService,
} from './queries.types';

const API_URL_SUFFIX = 'system-management';
const CONTROLLER = 'queries';

export class QueriesService extends DomainBaseService<IQuery, uuid> implements IQueriesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async fetchByType(type: QueryType): Promise<IQuery[]> {
    return this.http.get(`${this.baseUrl}/fetch-by-type/${type}`);
  }

  async create(query: IQuery) {
    return this.http.post<Promise<IQuery>>(`${this.baseUrl}`, query);
  }

  async edit(query: IQuery) {
    return this.http.patch<Promise<IQuery>>(`${this.baseUrl}/${query.id}`, query);
  }

  async getPowerBiTokenForReport(reportName: string): Promise<IPowerBiTokenDetails> {
      return this.http.get(`${this.http.baseUrl}/common/power-bi/embed-info/${reportName}`);
  }
}
