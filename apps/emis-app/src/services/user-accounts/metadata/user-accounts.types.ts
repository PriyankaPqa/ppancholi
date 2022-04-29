import { IDomainBaseService } from '@libs/core-lib/services/base';
import { IUserAccountMetadata } from '@/entities/user-account';

export interface IUserAccountsMetadataService extends IDomainBaseService<IUserAccountMetadata, uuid> {}
