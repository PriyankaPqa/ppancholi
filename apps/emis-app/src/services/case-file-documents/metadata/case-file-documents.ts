import { ICaseFileDocumentMetadata } from '@/entities/case-file-document';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { ICaseFileDocumentsMetadataService } from './case-file-documents.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'documents/metadata';
interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseFileDocumentsMetadataService extends DomainBaseService<ICaseFileDocumentMetadata, UrlParams>
  implements ICaseFileDocumentsMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
