import { ICaseNoteMetadata } from '@/entities/case-note';
import { IDomainBaseService } from '@/services/base';

export interface ICaseNotesMetadataService extends IDomainBaseService<ICaseNoteMetadata, uuid> {}
