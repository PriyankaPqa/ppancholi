import { IAssessmentTemplateEntity, IAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IAssessmentTemplatesService } from './assessment-templates.types';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '../../../types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-templates';
interface UrlParams { id: uuid }

export class AssessmentTemplatesService extends DomainBaseService<IAssessmentTemplateEntity, UrlParams>
  implements IAssessmentTemplatesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async create(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> {
    return this.http.post<IAssessmentTemplateEntity>(this.getItemUrl(`${this.baseUrl}`, item), item);
  }

  async update(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> {
    return this.http.patch<IAssessmentTemplateEntity>(this.getItemUrl(`${this.baseUrl}/{id}/edit`, item), item);
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<IAssessmentTemplateEntity, IAssessmentTemplateMetadata>> {
    return this.http.get(`assessment/search/${searchEndpoint ?? 'assessment-templates'}`, { params, isOData: true });
  }
}
