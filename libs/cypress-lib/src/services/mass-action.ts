import { IHttpClient } from '@libs/services-lib/src/http-client';
import { IMassActionEntity } from '@libs/entities-lib/mass-action';

export class CypressMassActionsService {
  constructor(protected readonly http: IHttpClient) {}

  async createWithFile(urlSuffix: string, payload: unknown): Promise<IMassActionEntity> {
    return this.http.post(`case-file/mass-actions/${urlSuffix}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}
