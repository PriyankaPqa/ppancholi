import { ICaseNoteMetadata } from '@libs/entities-lib/case-note';
import { IDomainBaseService } from '../../base';

export interface ICaseNotesMetadataService extends IDomainBaseService<ICaseNoteMetadata, { id: uuid, caseFileId: uuid }> {}
