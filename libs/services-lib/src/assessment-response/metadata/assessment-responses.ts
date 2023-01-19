import { IAssessmentResponseMetadata, IdParams } from '@libs/entities-lib/assessment-template';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';
import { IAssessmentResponsesMetadataService } from './assessment-responses.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-responses/metadata';

export class AssessmentResponsesMetadataService extends DomainBaseService<IAssessmentResponseMetadata, IdParams>
  implements IAssessmentResponsesMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
