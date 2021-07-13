/* eslint-disable */
import { mockCaseFileReferralEntity } from '@/entities/case-file-referral';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { CaseFileReferralsService } from './case-file-referrals';

describe('>>> Case File Referral Service', () => {
  let http: IHttpMock;
  let service: CaseFileReferralsService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new CaseFileReferralsService(http as never);
  });

  describe('Todo', () => {
    it('is linked to the correct URL and params', async () => {
      const id = 'id';
      const entity = mockCaseFileReferralEntity();
      // await service.addCaseNote(id, caseNote);
      // expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/case-notes`, {
      //   subject: caseNote.subject,
      //   description: caseNote.description,
      //   category: {
      //     optionItemId: caseNote.category.optionItemId,
      //   },
      // });
    });
  });
});
