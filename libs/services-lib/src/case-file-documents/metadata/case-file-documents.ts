import { ICaseFileDocumentMetadata } from '@libs/entities-lib/case-file-document';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
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
