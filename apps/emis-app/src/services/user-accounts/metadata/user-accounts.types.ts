import { IDomainBaseService } from '@libs/core-lib/services/base';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';

export interface IUserAccountsMetadataService extends IDomainBaseService<IUserAccountMetadata, uuid> {}
