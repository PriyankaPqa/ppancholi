/* eslint-disable @typescript-eslint/no-explicit-any */
import { DomainBaseService } from '../../base';
import { IHouseholdMetadataService } from './households.types';
import { IHttpClient } from '../../httpClient';

import { IHouseholdMetadata } from '../../../entities/household';

const API_URL_SUFFIX = 'households';
const CONTROLLER = 'household/metadata';

export class HouseholdMetadataService extends DomainBaseService<IHouseholdMetadata> implements IHouseholdMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
