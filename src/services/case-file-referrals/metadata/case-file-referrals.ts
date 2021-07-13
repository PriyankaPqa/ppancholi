import { ICaseFileReferralMetadata } from '@/entities/case-file-referral';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { ICaseFileReferralsMetadataService } from './case-file-referrals.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'case-files/metadata';

export class CaseFileReferralsMetadataService extends DomainBaseService<ICaseFileReferralMetadata> implements ICaseFileReferralsMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }
}
