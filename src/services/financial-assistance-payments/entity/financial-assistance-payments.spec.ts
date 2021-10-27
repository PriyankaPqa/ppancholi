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
      expect(http.post).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments',
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
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myId',
        {
          description: "thl payment desc",
          financialAssistanceTableId: "c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a",
          name: "thl payment",
        });
    });
  });
  
  describe('updatePaymentStatus', () => {
    it('is linked to the correct URL and params', async () => {
      await service.updatePaymentStatus(entity.id, 'group-id', 2);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myId/groups/group-id/payment-status', {paymentStatus : 2});
    });
  });

  describe('submitFinancialAssistancePayment', () => {
    it('is linked to the correct URL and params', async () => {
      await service.submitFinancialAssistancePayment(entity.id);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myId/submit');
    });
  });
  
  describe('addFinancialAssistancePaymentLine', () => {
    it('is linked to the correct URL and params', async () => {
      await service.addFinancialAssistancePaymentLine('myParent', entity.groups[0]);
      expect(http.post).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myParent/lines',
        {
          ...entity.groups[0].groupingInformation,
          ...entity.groups[0].lines[0],
        });
    });
  });

  describe('editFinancialAssistancePaymentLine', () => {
    it('is linked to the correct URL and params', async () => {
      await service.editFinancialAssistancePaymentLine('myParent', entity.groups[0]);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myParent/lines/' + entity.groups[0].lines[0].id,
        {
          ...entity.groups[0].groupingInformation,
          ...entity.groups[0].lines[0],
        });
    });
  });

  describe('deleteFinancialAssistancePaymentLine', () => {
    it('is linked to the correct URL and params', async () => {
      await service.deleteFinancialAssistancePaymentLine('myParent', 'myId');
      expect(http.delete).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myParent/lines/myId');
    });
  });

  describe('getHistory', () => {
    it('is linked to the correct URL and params', async () => {
      await service.getHistory('myId');
      expect(http.get).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myId/history');
    });
  });

  describe('getMetadataHistory', () => {
    it('is linked to the correct URL and params', async () => {
      await service.getMetadataHistory('myId');
      expect(http.get).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/metadata/myId/history');
    });
  });

  describe('getPaymentSummary', () => {
    it('is linked to the correct URL and params', async () => {
      await service.getPaymentSummary('myCaseId');
      expect(http.get).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/payments-summary?caseFileId=myCaseId');
    });
  });
});
