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

  describe('addFinancialAssistancePayment', () => {
    it('is linked to the correct URL and params', async () => {
      await service.addFinancialAssistancePayment(entity);
      expect(http.post).toHaveBeenCalledWith('www.test.com/financial-assistance/financial-assistance-payments',
        {
          caseFileId: "myParent",
          description: "thl payment desc",
          financialAssistanceTableId: "c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a",
          groups: [
            {
              ...entity.groups[0].groupingInformation,
              lines: entity.groups[0].lines
            },
          ],
          name: "thl payment",
        });
    });
  });

  describe('editFinancialAssistancePayment', () => {
    it('is linked to the correct URL and params', async () => {
      await service.editFinancialAssistancePayment(entity);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/financial-assistance/financial-assistance-payments/myId',
        {
          description: "thl payment desc",
          financialAssistanceTableId: "c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a",
          name: "thl payment",
        });
    });
  });
});
