import {
 IAssessmentFormEntity, IAssessmentFormMetadata, IAssessmentTotalSubmissions, IdParams,
} from '@libs/entities-lib/assessment-template';
import { IAzureSearchParams, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IAssessmentFormsService } from './assessment-forms.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-forms';

export class AssessmentFormsService extends DomainBaseService<IAssessmentFormEntity, IdParams>
  implements IAssessmentFormsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async getForBeneficiary(id: string): Promise<IAssessmentFormEntity> {
    return this.http.get<IAssessmentFormEntity>(this.getItemUrl(`${this.baseUrl}/{id}/public`, { id }), { globalHandler: false });
  }

  async create(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity> {
    return this.http.post<IAssessmentFormEntity>(this.getItemUrl(`${this.baseUrl}`, item), this.http.getPayloadAsFile(item), { globalHandler: false });
  }

  async update(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity> {
    return this.http.patch<IAssessmentFormEntity>(this.getItemUrl(`${this.baseUrl}/{id}`, item), this.http.getPayloadAsFile(item), { globalHandler: false });
  }

  async updateAssessmentStructure(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity> {
    return this.http.patch<IAssessmentFormEntity>(this.getItemUrl(`${this.baseUrl}/{id}/updateAssessmentStructure`, item), this.http.getPayloadAsFile(item));
  }

  async fetchByProgramId(programId: uuid): Promise<IAssessmentFormEntity[]> {
    return this.http.get(`${API_URL_SUFFIX}/programs/${programId}/${ENTITY}`);
  }

  async htmlToWord(data: string, filename: string) {
    return this.http.postFullResponse<BlobPart>(`${API_URL_SUFFIX}/tools/HtmlToWord/extract.docx`, this.http.getPayloadAsFile(data), { responseType: 'blob' }).then(
      (response) => this.http.getRestResponseAsFile(response, true, filename),
    );
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<IAssessmentFormEntity, IAssessmentFormMetadata>> {
    return this.http.get(`assessment/search/${searchEndpoint ?? 'assessment-forms'}`, { params, isOData: true });
  }

  async assessmentTotalSubmissions(id: uuid):
    Promise<IAssessmentTotalSubmissions> {
    return this.http.get<IAssessmentTotalSubmissions>(this.getItemUrl(`${this.baseUrl}/{id}/assessment-total-submissions`, id));
  }
}
