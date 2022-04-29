import { IDomainBaseService } from '@libs/core-lib/services/base';
import { IMassActionMetadata } from '@/entities/mass-action/massActions.types';

export interface IMassActionMetadataService extends IDomainBaseService<IMassActionMetadata, uuid> {}
