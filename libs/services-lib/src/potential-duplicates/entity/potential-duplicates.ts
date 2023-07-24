import { IPotentialDuplicateEntity, IDuplicateHousehold, DuplicateReason } from '@libs/entities-lib/potential-duplicate';
import { IHttpClient } from '../../http-client';

import { DomainBaseService } from '../../base';
import { IPotentialDuplicatesService } from './potential-duplicates.types';

const API_URL_SUFFIX = 'household';
const CONTROLLER = 'potential-duplicates';

export class PotentialDuplicatesService extends DomainBaseService<IPotentialDuplicateEntity, uuid> implements IPotentialDuplicatesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async getHouseholds(id: uuid): Promise<IDuplicateHousehold[]> {
    return this.http.get(`${this.baseUrl}/${id}/households`);
  }

  async getDuplicates(id: uuid): Promise<IPotentialDuplicateEntity[]> {
    return this.http.get(`${this.baseUrl}/${id}/duplicates`);
  }

  flagNewDuplicate(payload: { householdIds: uuid[], duplicateReasons: DuplicateReason[], memberFirstName: string, memberLastName: string, rationale: string })
  : Promise<IPotentialDuplicateEntity> {
  return this.http.post(`${this.baseUrl}/duplicates`, payload);
  }

  flagDuplicate(id: string, rationale: string): Promise<IPotentialDuplicateEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/flag-duplicates`, { rationale });
  }

  resolveDuplicate(id: string, rationale: string): Promise<IPotentialDuplicateEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/resolve-duplicates`, { rationale });
  }
}
