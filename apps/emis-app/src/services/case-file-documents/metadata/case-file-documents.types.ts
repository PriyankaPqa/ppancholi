import { ICaseFileDocumentMetadata } from '@/entities/case-file-document';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface ICaseFileDocumentsMetadataService extends IDomainBaseService<ICaseFileDocumentMetadata, { id: uuid, caseFileId: uuid }> {}
