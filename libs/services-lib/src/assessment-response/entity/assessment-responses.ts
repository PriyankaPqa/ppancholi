import {
  IAssessmentResponseCreateRequest, IAssessmentResponseEntity, IdParams,
} from '@libs/entities-lib/assessment-template';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/src/base';
import { GlobalHandler, IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IAssessmentResponsesService } from './assessment-responses.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-responses';

export class AssessmentResponsesService extends DomainBaseService<IAssessmentResponseEntity, IdParams>
  implements IAssessmentResponsesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async getForBeneficiary(id: string): Promise<IAssessmentResponseEntity> {
    return this.http.get<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/public`, { id }), { globalHandler: GlobalHandler.Partial });
  }

  async create(item: IAssessmentResponseCreateRequest): Promise<IAssessmentResponseEntity> {
    return this.http.post<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}`, item), item);
  }

  async update(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}`, item), item, {
      globalHandler: GlobalHandler.Partial,
      transformRequest: [(data) => this.http.getPayloadAsFile(data)],
    });
  }

  async saveAssessmentAnsweredQuestions(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/saveAssessmentAnsweredQuestions`, item), item, {
      transformRequest: [(data) => this.http.getPayloadAsFile(data)],
    });
  }

  async completeSurvey(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/submit`, item));
  }

  async completeSurveyByBeneficiary(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/submit/public`, item));
  }

  async search(params: IAzureSearchParams):
    Promise<IAzureCombinedSearchResult<IAssessmentResponseEntity, IEntity>> {
    return this.http.get('assessment/search/assessment-responsesV2', { params, isODataSql: true });
  }
}
