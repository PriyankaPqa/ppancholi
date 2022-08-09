import { ICaseFileDocumentMetadata } from '@libs/entities-lib/case-file-document';
import { IDomainBaseService } from '../../base';

export interface ICaseFileDocumentsMetadataService extends IDomainBaseService<ICaseFileDocumentMetadata, { id: uuid, caseFileId: uuid }> {}
