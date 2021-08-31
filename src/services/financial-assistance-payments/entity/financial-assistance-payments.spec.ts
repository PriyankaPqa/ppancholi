/* eslint-disable */
import { IFinancialAssistancePaymentEntity, mockCaseFinancialAssistanceEntity } from '@/entities/financial-assistance-payment';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { FinancialAssistancePaymentsService } from './financial-assistance-payments';

describe('>>> Financial assistance payment Service', () => {
  let http: IHttpMock;
  let service: FinancialAssistancePaymentsService;
  let entity: IFinancialAssistancePaymentEntity;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    entity = mockCaseFinancialAssistanceEntity();
    entity.id = 'myId';
    entity.caseFileId = 'myParent';
    jest.clearAllMocks();
    http = mockHttp();
    service = new FinancialAssistancePaymentsService(http as never);
  });
  
  describe('todo once we have specific endpoints...', () => {
    it('is linked to the correct URL and params', async () => {
      // await service.updateDocument(entity);
      // expect(http.patch).toHaveBeenCalledWith('www.test.com/case-file/case-files/myParent/documents/myId/edit',
      //   entity);
    });
  });
  
});
