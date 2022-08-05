import { BaseModule } from '@/store/modules/base';
import { ICaseFileMetadata } from '@libs/entities-lib/case-file';

export class CaseFileMetadataModule extends BaseModule<ICaseFileMetadata, uuid> {}
