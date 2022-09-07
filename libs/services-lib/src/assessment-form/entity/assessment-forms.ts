import { IAssessmentFormEntity, IAssessmentFormMetadata } from '@libs/entities-lib/assessment-template';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IAssessmentFormsService } from './assessment-forms.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-forms';
interface UrlParams { id: uuid }

export class AssessmentFormsService extends DomainBaseService<IAssessmentFormEntity, UrlParams>
  implements IAssessmentFormsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async create(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity> {
    return this.http.post<IAssessmentFormEntity>(this.getItemUrl(`${this.baseUrl}`, item), item, { globalHandler: false });
  }

  async update(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity> {
    return this.http.patch<IAssessmentFormEntity>(this.getItemUrl(`${this.baseUrl}/{id}`, item), item, { globalHandler: false });
  }

  async updateAssessmentStructure(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity> {
    return this.http.patch<IAssessmentFormEntity>(this.getItemUrl(`${this.baseUrl}/{id}/updateAssessmentStructure`, item), item);
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<IAssessmentFormEntity, IAssessmentFormMetadata>> {
    return this.http.get(`assessment/search/${searchEndpoint ?? 'assessment-forms'}`, { params, isOData: true });
  }
}
