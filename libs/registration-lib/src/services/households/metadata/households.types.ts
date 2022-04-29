import { IDomainBaseService } from '@libs/core-lib/services/base';
import { IHouseholdMetadata } from '../../../entities/household';

export interface IHouseholdMetadataService extends IDomainBaseService<IHouseholdMetadata, uuid> {}
