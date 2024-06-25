import { ICaseFileReferralEntity } from '@libs/entities-lib/case-file-referral';
import { ICombinedSearchResult, ISearchParams } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/base';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
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

  async search(params: ISearchParams):
    Promise<ICombinedSearchResult<ICaseFileReferralEntity, IEntity>> {
    return this.http.get('case-file/search/referralsV2', { params, isOData: true });
  }
}
