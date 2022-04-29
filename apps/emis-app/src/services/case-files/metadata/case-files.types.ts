import { ICaseFileMetadata } from '@/entities/case-file';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface ICaseFilesMetadataService extends IDomainBaseService<ICaseFileMetadata, uuid> {}
