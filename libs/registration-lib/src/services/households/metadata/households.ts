/* eslint-disable @typescript-eslint/no-explicit-any */
import { IHttpClient } from '@libs/core-lib/src/services/http-client';
import { DomainBaseService } from '@libs/core-lib/services/base';
import { IHouseholdMetadata } from '@libs/entities-lib/household';
import { IHouseholdMetadataService } from './households.types';

const API_URL_SUFFIX = 'household';
const CONTROLLER = 'households/metadata';

export class HouseholdMetadataService extends DomainBaseService<IHouseholdMetadata, uuid> implements IHouseholdMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
