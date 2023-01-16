import { IFinancialAssistancePaymentEntity, mockCaseFinancialAssistanceEntity } from '@libs/entities-lib/financial-assistance-payment';
import { IHttpMock, mockHttp } from '../../http-client';
import { FinancialAssistancePaymentsService } from './financial-assistance-payments';

describe('>>> Financial assistance payment Service', () => {
  let http: IHttpMock;
  let service: FinancialAssistancePaymentsService;
  let entity: IFinancialAssistancePaymentEntity;

  beforeEach(() => {
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
      expect(http.post).toHaveBeenCalledWith(
'www.test.com/finance/financial-assistance-payments',
        {
          caseFileId: 'myParent',
          description: 'thl payment desc',
          financialAssistanceTableId: 'c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a',
          groups: [
            {
              ...entity.groups[0].groupingInformation,
              lines: entity.groups[0].lines,
            },
          ],
          name: 'thl payment',
        },
);
    });
  });

  describe('editFinancialAssistancePayment', () => {
    it('is linked to the correct URL and params', async () => {
      await service.editFinancialAssistancePayment(entity);
      expect(http.patch).toHaveBeenCalledWith(
'www.test.com/finance/financial-assistance-payments/myId',
        {
          description: 'thl payment desc',
          financialAssistanceTableId: 'c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a',
          name: 'thl payment',
        },
);
    });
  });

  describe('updatePaymentStatus', () => {
    it('is linked to the correct URL and params', async () => {
      await service.updatePaymentStatus(entity.id, 'group-id', 2);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myId/groups/group-id/payment-status', { paymentStatus: 2 });
    });
  });

  describe('submitFinancialAssistancePayment', () => {
    it('is linked to the correct URL and params', async () => {
      await service.submitFinancialAssistancePayment(entity.id);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myId/submit');
    });
  });

  describe('submitApprovalRequest', () => {
    it('is linked to the correct URL and params', async () => {
      await service.submitApprovalRequest('1', '2');
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/1/start-approval/2');
    });
  });

  describe('submitApprovalAction', () => {
    it('is linked to the correct URL and params', async () => {
      const payload = { approvalAction: 1, submittedTo: '2', rationale: 'my reason' };
      await service.submitApprovalAction('1', payload);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/1/action', payload);
    });
  });

  describe('addFinancialAssistancePaymentLine', () => {
    it('is linked to the correct URL and params', async () => {
      await service.addFinancialAssistancePaymentLine('myParent', entity.groups[0]);
      expect(http.post).toHaveBeenCalledWith(
'www.test.com/finance/financial-assistance-payments/myParent/lines',
        {
          ...entity.groups[0].groupingInformation,
          ...entity.groups[0].lines[0],
        },
);
    });
  });

  describe('editFinancialAssistancePaymentLine', () => {
    it('is linked to the correct URL and params', async () => {
      await service.editFinancialAssistancePaymentLine('myParent', entity.groups[0]);
      expect(http.patch).toHaveBeenCalledWith(
`www.test.com/finance/financial-assistance-payments/myParent/lines/${entity.groups[0].lines[0].id}`,
        {
          ...entity.groups[0].groupingInformation,
          ...entity.groups[0].lines[0],
        },
);
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

  describe('getNextApprovalGroupRoles', () => {
    it('is linked to the correct URL and params', async () => {
      await service.getNextApprovalGroupRoles('myId');
      expect(http.get).toHaveBeenCalledWith('www.test.com/finance/financial-assistance-payments/myId/next-approval-group-roles');
    });
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`finance/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('finance/search/financial-assistance-payments', { params, isOData: true });
    });
  });
});
