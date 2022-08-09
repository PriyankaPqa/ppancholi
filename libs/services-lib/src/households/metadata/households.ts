import { IHouseholdMetadata } from '@libs/entities-lib/household';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';
import { IHouseholdMetadataService } from './households.types';

const API_URL_SUFFIX = 'household';
const CONTROLLER = 'households/metadata';

export class HouseholdMetadataService extends DomainBaseService<IHouseholdMetadata, uuid> implements IHouseholdMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
