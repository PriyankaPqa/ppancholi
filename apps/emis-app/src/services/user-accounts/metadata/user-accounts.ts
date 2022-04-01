/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@libs/core-lib/services/http-client';

import { IUserAccountMetadata } from '@/entities/user-account';
import { DomainBaseService } from '@/services/base';
import { IUserAccountsMetadataService } from './user-accounts.types';

const apiUrlSuffix = 'user-account';
const controller = 'user-accounts/metadata';

export class UserAccountsMetadataService extends DomainBaseService<IUserAccountMetadata, uuid> implements IUserAccountsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
