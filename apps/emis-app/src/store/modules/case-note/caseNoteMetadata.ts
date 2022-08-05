import { BaseModule } from '@/store/modules/base';
import { ICaseNoteMetadata } from '@libs/entities-lib/case-note';

export class CaseNoteMetadataModule extends BaseModule<ICaseNoteMetadata, { id: uuid, caseFileId: uuid }> {}
