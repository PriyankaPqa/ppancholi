import { DomainBaseService } from '@/services/base';
import { IHttpClient, IRestResponse } from '@libs/core-lib/services/http-client';
import { IMassActionExportListPayload, IMassActionService } from '@/services/mass-actions/entity/massAction.types';
import { IMassActionEntity, MassActionRunType, MassActionType } from '@/entities/mass-action/massActions.types';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/core-lib/types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'mass-actions';

export class MassActionService extends DomainBaseService<IMassActionEntity, uuid> implements IMassActionService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null): Promise<IAzureCombinedSearchResult<IMassActionEntity, unknown>> {
    return this.http.get(`${API_URL_SUFFIX}/search/${searchEndpoint ?? CONTROLLER}`, { params, isOData: true });
  }

  async process(id: uuid, runType: MassActionRunType): Promise<IMassActionEntity> {
    return this.http.post(`${this.baseUrl}/${id}/run`, { runType });
  }

  async update(id: uuid, payload: {name: string; description: string}): Promise<IMassActionEntity> {
    return this.http.patch(`${this.baseUrl}/${id}`, payload);
  }

  async getInvalidFile({ massActionId, runId, language }: {massActionId: uuid; runId: uuid; language: string}): Promise<IRestResponse<string>> {
    return this.http.getFullResponse(`${this.baseUrl}/${massActionId}/invalid-file`, {
      params: {
        runId,
        language,
      },
    });
  }

  async create(urlSuffix: string, payload: unknown): Promise<IMassActionEntity> {
    return this.http.post(`${this.baseUrl}/${urlSuffix}`, payload);
  }

  async exportList(massActionType: MassActionType, payload: IMassActionExportListPayload): Promise<IRestResponse<string>> {
    let urlSuffix = '';

    if (massActionType === MassActionType.FinancialAssistance) {
      urlSuffix = 'export-financial-assistance-records';
    }
    if (massActionType === MassActionType.ExportValidationOfImpactStatus) {
      urlSuffix = 'export-validation-of-impact-records';
    }
    // Remove when EMISV2-3799 is done - Temporary timeout to 10 minutes
    return this.http.postFullResponse(`${this.baseUrl}/${urlSuffix}`, payload, { timeout: 600000 });
  }

  async getValidFile({ massActionId, runId, language }: {massActionId: uuid; runId: uuid; language: string}): Promise<IRestResponse<string>> {
    return this.http.getFullResponse(`${this.baseUrl}/${massActionId}/valid-file`, {
      params: {
        runId,
        language,
      },
    });
  }
}
