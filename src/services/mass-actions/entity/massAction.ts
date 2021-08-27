import { DomainBaseService } from '@/services/base';
import { IHttpClient, IRestResponse } from '@/services/httpClient';
import { IMassActionService } from '@/services/mass-actions/entity/massAction.types';
import { IMassActionEntity, MassActionRunType } from '@/entities/mass-action/massActions.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'mass-actions';

export class MassActionService extends DomainBaseService<IMassActionEntity, uuid> implements IMassActionService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async process(id: uuid, runType: MassActionRunType): Promise<IMassActionEntity> {
    return this.http.post(`${this.baseUrl}/${id}/run`, { runType });
  }

  async update(id: uuid, payload: {name: string; description: string}): Promise<IMassActionEntity> {
    return this.http.patch(`${this.baseUrl}/${id}`, payload);
  }

  async getInvalidFile(massActionId: uuid, runId: uuid): Promise<IRestResponse<string>> {
    return this.http.getFullResponse(`${this.baseUrl}/${massActionId}/invalid-file`, {
      params: {
        runId,
      },
    });
  }
}
