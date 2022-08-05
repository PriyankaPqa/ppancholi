import { IAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';
import { IAssessmentTemplatesMetadataService } from './assessment-templates.types';

const API_URL_SUFFIX = 'assessment';
const ENTITY = 'assessment-templates/metadata';
interface UrlParams { id: uuid }

export class AssessmentTemplatesMetadataService extends DomainBaseService<IAssessmentTemplateMetadata, UrlParams>
  implements IAssessmentTemplatesMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
