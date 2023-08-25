import {
  IMassActionEntity, MassActionDataCorrectionType, MassActionRunType, MassActionType,
} from '@libs/entities-lib/mass-action/massActions.types';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { IMassActionExportListPayload, IMassActionService } from './massAction.types';
import { IHttpClient, IRestResponse } from '../../http-client';
import { DomainBaseService } from '../../base';

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

  async update(id: uuid, payload: { name: string; description: string }): Promise<IMassActionEntity> {
    return this.http.patch(`${this.baseUrl}/${id}`, payload);
  }

  async getInvalidFile({ massActionId, runId, language }: { massActionId: uuid; runId: uuid; language: string }): Promise<IRestResponse<string>> {
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
    if (massActionType === MassActionType.Assessments) {
      urlSuffix = 'export-assessment-records';
    }
    if (massActionType === MassActionType.ExportValidationOfImpactStatus) {
      urlSuffix = 'export-validation-of-impact-records';
    }
    // Remove when EMISV2-3799 is done - Temporary timeout to 10 minutes
    return this.http.postFullResponse(`${this.baseUrl}/${urlSuffix}`, payload, { timeout: 600000 });
  }

  async getValidFile({ massActionId, runId, language, massActionType }: {
    massActionId: uuid;
    runId: uuid;
    language: string;
    massActionType?: MassActionType | MassActionDataCorrectionType
  }): Promise<IRestResponse<string>> {
    return this.http.getFullResponse(`${this.baseUrl}/${massActionId}/valid-file`, {
      params: {
        runId,
        language,
        massActionType,
      },
    });
  }

  async downloadTemplate(massActionDataCorrectionType: MassActionType | MassActionDataCorrectionType): Promise<IRestResponse<BlobPart>> {
    return this.http.getFullResponse(`${this.baseUrl}/templates`, {
      responseType: 'blob',
      params: {
        MassActionType: massActionDataCorrectionType,
      },
    });
  }
}
