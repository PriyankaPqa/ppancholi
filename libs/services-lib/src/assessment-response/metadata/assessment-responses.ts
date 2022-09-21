import { IAssessmentResponseMetadata } from '@libs/entities-lib/assessment-template';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';
import { IAssessmentResponsesMetadataService } from './assessment-responses.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-responses/metadata';
interface UrlParams { id: uuid }

export class AssessmentResponsesMetadataService extends DomainBaseService<IAssessmentResponseMetadata, UrlParams>
  implements IAssessmentResponsesMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
