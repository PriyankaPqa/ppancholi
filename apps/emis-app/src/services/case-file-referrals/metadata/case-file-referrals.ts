import { ICaseFileReferralMetadata } from '@/entities/case-file-referral';
import { DomainBaseService } from '@libs/core-lib/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { ICaseFileReferralsMetadataService } from './case-file-referrals.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'referrals/metadata';
interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseFileReferralsMetadataService extends DomainBaseService<ICaseFileReferralMetadata, UrlParams>
  implements ICaseFileReferralsMetadataService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
