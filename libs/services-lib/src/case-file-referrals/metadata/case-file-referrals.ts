import { ICaseFileReferralMetadata } from '@libs/entities-lib/case-file-referral';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
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
