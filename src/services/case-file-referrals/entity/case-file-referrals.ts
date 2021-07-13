import { ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';

import { ICaseFileReferralsService } from './case-file-referrals.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'referrals';

export class CaseFileReferralsService extends DomainBaseService<ICaseFileReferralEntity> implements ICaseFileReferralsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
