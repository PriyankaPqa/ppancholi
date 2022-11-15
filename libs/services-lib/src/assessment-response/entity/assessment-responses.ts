import {
  IAssessmentResponseCreateRequest, IAssessmentResponseEntity, IAssessmentResponseMetadata, IQuestionResponse,
} from '@libs/entities-lib/assessment-template';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IAssessmentResponsesService } from './assessment-responses.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-responses';
interface UrlParams { id: uuid }

export class AssessmentResponsesService extends DomainBaseService<IAssessmentResponseEntity, UrlParams>
  implements IAssessmentResponsesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async getForBeneficiary(id: string): Promise<IAssessmentResponseEntity> {
    return this.http.get<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/public`, { id }), { globalHandler: false });
  }

  async create(item: IAssessmentResponseCreateRequest): Promise<IAssessmentResponseEntity> {
    return this.http.post<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}`, item), item);
  }

  async update(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}`, item), item, { globalHandler: false });
  }

  async saveAssessmentAnsweredQuestions(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/saveAssessmentAnsweredQuestions`, item), item);
  }

  async completeSurvey(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/submit`, item));
  }

  async completeSurveyByBeneficiary(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity> {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/submit/public`, item));
  }

  async editAssessmentAnsweredQuestion(id: string,
    request: { responses: IQuestionResponse[], assessmentQuestionIdentifier: string, parentIndexPath: string }) {
    return this.http.patch<IAssessmentResponseEntity>(this.getItemUrl(`${this.baseUrl}/{id}/editAssessmentAnsweredQuestion`, { id }), request);
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<IAssessmentResponseEntity, IAssessmentResponseMetadata>> {
    return this.http.get(`assessment/search/${searchEndpoint ?? 'assessment-responses'}`, { params, isOData: true });
  }
}
