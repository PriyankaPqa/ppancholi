import { IAssessmentFormMetadata, IdParams } from '@libs/entities-lib/assessment-template';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';
import { IAssessmentFormsMetadataService } from './assessment-forms.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-forms/metadata';

export class AssessmentFormsMetadataService extends DomainBaseService<IAssessmentFormMetadata, IdParams>
  implements IAssessmentFormsMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
