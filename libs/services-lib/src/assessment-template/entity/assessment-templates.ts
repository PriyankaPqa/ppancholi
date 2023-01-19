import { IAssessmentTemplateEntity, IAssessmentTemplateMetadata, IdParams } from '@libs/entities-lib/assessment-template';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IAssessmentTemplatesService } from './assessment-templates.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-templates';

export class AssessmentTemplatesService extends DomainBaseService<IAssessmentTemplateEntity, IdParams>
  implements IAssessmentTemplatesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async create(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> {
    return this.http.post<IAssessmentTemplateEntity>(this.getItemUrl(`${this.baseUrl}`, item), item, { globalHandler: false });
  }

  async update(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> {
    return this.http.patch<IAssessmentTemplateEntity>(this.getItemUrl(`${this.baseUrl}/{id}`, item), item, { globalHandler: false });
  }

  async updateAssessmentStructure(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity> {
    return this.http.patch<IAssessmentTemplateEntity>(this.getItemUrl(`${this.baseUrl}/{id}/updateAssessmentStructure`, item), item);
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<IAssessmentTemplateEntity, IAssessmentTemplateMetadata>> {
    return this.http.get(`assessment/search/${searchEndpoint ?? 'assessment-templates'}`, { params, isOData: true });
  }
}
