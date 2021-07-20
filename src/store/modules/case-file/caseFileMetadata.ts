import { BaseModule } from '@/store/modules/base';
import { ICaseFileMetadata } from '@/entities/case-file';

export class CaseFileMetadataModule extends BaseModule<ICaseFileMetadata, uuid> {}
