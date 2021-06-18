/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@/services/httpClient';

import { IUserAccountMetadata } from '@/entities/user-account';
import { DomainBaseService } from '@/services/base';
import { IUserAccountsMetadataService } from './user-accounts.types';

const apiUrlSuffix = 'user-account';
const controller = 'user-accounts/metadata';

export class UserAccountsMetadataService extends DomainBaseService<IUserAccountMetadata> implements IUserAccountsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
