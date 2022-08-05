import { IDomainBaseService } from '@libs/core-lib/services/base';
import { IMassActionMetadata } from '@libs/entities-lib/mass-action/massActions.types';

export interface IMassActionMetadataService extends IDomainBaseService<IMassActionMetadata, uuid> {}
