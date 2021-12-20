/**
 * @group services
 */

/* eslint-disable */
import { mockCaseFileReferralEntity } from '@/entities/case-file-referral';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { CaseFileReferralsService } from './case-file-referrals';

describe('>>> Case File Referral Service', () => {
  let http: IHttpMock;
  let service: CaseFileReferralsService;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFileReferralsService(http as never);
  });

  describe('get', () => {
    it('is linked to the correct URL and params', async () => {
      const id = {id: 'myId', caseFileId: 'myParent'};
      const entity = mockCaseFileReferralEntity();
      await service.get(id);
      expect(http.get).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/referrals/myId', { globalHandler: true });
    });
  });

  describe('createReferral', () => {
    it('is linked to the correct URL and params', async () => {
      const entity = mockCaseFileReferralEntity();
      entity.caseFileId = 'myParent';
      await service.createReferral(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/referrals',
        service.cleanReferral(entity));
    });
  });

  describe('updateReferral', () => {
    it('is linked to the correct URL and params', async () => {
      const entity = mockCaseFileReferralEntity();
      entity.id = 'myId';
      entity.caseFileId = 'myParent';
      await service.updateReferral(entity);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/referrals/myId/edit',
        service.cleanReferral(entity));
    });
  });

  describe('cleanReferral', () => {
    it('returns the referral with outcome status cleaned', () => {
      const entity = mockCaseFileReferralEntity();
      entity.outcomeStatus = { optionItemId: null, specifiedOther: null };
      let result = service.cleanReferral(entity);
      expect(result.outcomeStatus).toBeNull();

      entity.outcomeStatus = { optionItemId: 'abd', specifiedOther: null };
      result = service.cleanReferral(entity);
      expect(result.outcomeStatus).toEqual({ optionItemId: 'abd', specifiedOther: null });
    });

    it('returns the date of consent at the root', () => {
      const entity = mockCaseFileReferralEntity();
      entity.referralConsentInformation = null;
      let result = service.cleanReferral(entity);
      expect(result.dateTimeConsent).toBeUndefined();

      entity.referralConsentInformation = { dateTimeConsent: new Date('2020-01-01'), crcUserName: '', crcUserId: ''};
      result = service.cleanReferral(entity);
      expect(result.dateTimeConsent).toEqual(new Date('2020-01-01'));
    });
  });
});
