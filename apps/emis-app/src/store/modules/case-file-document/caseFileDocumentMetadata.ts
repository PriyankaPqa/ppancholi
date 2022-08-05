import { BaseModule } from '@/store/modules/base';
import { ICaseFileDocumentMetadata } from '@libs/entities-lib/case-file-document';

export class CaseFileDocumentMetadataModule extends BaseModule<ICaseFileDocumentMetadata, { id: uuid, caseFileId: uuid }> {}
