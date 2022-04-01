import { IHttpClient } from '@libs/core-lib/services/http-client';
import { DomainBaseService } from '@/services/base';
import { ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { ICaseFileReferralsService } from './case-file-referrals.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'referrals';
interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseFileReferralsService extends DomainBaseService<ICaseFileReferralEntity, UrlParams>
  implements ICaseFileReferralsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async createReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> {
    return this.http.post<ICaseFileReferralEntity>(this.getItemUrl(`${this.baseUrl}`, item), this.cleanReferral(item));
  }

  async updateReferral(item: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> {
    return this.http.patch<ICaseFileReferralEntity>(this.getItemUrl(`${this.baseUrl}/{id}/edit`, item), this.cleanReferral(item));
  }

  cleanReferral(item: ICaseFileReferralEntity) {
    return {
      ...item,
      dateTimeConsent: item.referralConsentInformation?.dateTimeConsent,
      outcomeStatus: item.outcomeStatus?.optionItemId ? item.outcomeStatus : null,
    };
  }
}
