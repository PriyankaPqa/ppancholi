/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { IHttpClient } from '../../http-client';

import { DomainBaseService } from '../../base';
import { IUserAccountsMetadataService } from './user-accounts.types';

const apiUrlSuffix = 'user-account';
const controller = 'user-accounts/metadata';

export class UserAccountsMetadataService extends DomainBaseService<IUserAccountMetadata, uuid> implements IUserAccountsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
