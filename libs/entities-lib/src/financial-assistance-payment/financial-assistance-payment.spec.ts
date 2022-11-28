import { mockCaseFinancialAssistanceEntity } from './financial-assistance-payment.mock';
import { FinancialAssistancePaymentEntity } from './index';
import { ApprovalStatus } from './financial-assistance-payment.types';

const mockData = mockCaseFinancialAssistanceEntity();

describe('>>> Case Financial Assistance', () => {
  describe('>> constructor', () => {
    describe('>> instantiate when data is passed', () => {
      it('should instantiate caseFileId', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantiate financialAsssistanceTablleId', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.financialAssistanceTableId).toEqual(mockData.financialAssistanceTableId);
      });

      it('should instantiate name', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.name).toEqual(mockData.name);
      });

      it('should instantiate description', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.description).toEqual(mockData.description);
      });

      it('should instantiate paymentStatus', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.approvalStatus).toEqual(mockData.approvalStatus);
      });

      it('should instantiate groups', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.groups).toEqual(mockData.groups);
      });

      it('should instantiate approvalStatusHistory', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.approvalStatusHistory).toEqual(mockData.approvalStatusHistory);
      });

      it('should instantiate approvalAction', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
        expect(caseFinancialAssistanceEntity.approvalAction).toEqual(null);

        const caseFinancialAssistanceEntity2 = new FinancialAssistancePaymentEntity({ ...mockData, approvalAction: 1 });
        expect(caseFinancialAssistanceEntity2.approvalAction).toEqual(1);
      });
    });

    describe('>> instantiate when data is not passed', () => {
      it('should instantiate caseFileId', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity();
        expect(caseFinancialAssistanceEntity.caseFileId).toEqual(null);
      });

      it('should instantiate financialAsssistanceTablleId', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity();
        expect(caseFinancialAssistanceEntity.financialAssistanceTableId).toEqual(null);
      });

      it('should instantiate name', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity();
        expect(caseFinancialAssistanceEntity.name).toEqual(null);
      });

      it('should instantiate description', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity();
        expect(caseFinancialAssistanceEntity.description).toEqual(null);
      });

      it('should instantiate paymentStatus', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity();
        expect(caseFinancialAssistanceEntity.approvalStatus).toEqual(ApprovalStatus.New);
      });

      it('should instantiate groups', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity();
        expect(caseFinancialAssistanceEntity.groups).toEqual([]);
      });

      it('should instantiate approvalStatusHistory', () => {
        const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity();
        expect(caseFinancialAssistanceEntity.approvalStatusHistory).toEqual(null);
      });
    });
  });

  describe('>> validation', () => {
    test('name is required', () => {
      const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
      caseFinancialAssistanceEntity.name = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('The name is required');
    });

    test('groups is required', () => {
      const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
      caseFinancialAssistanceEntity.groups = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('At least one payment line is required');
    });

    test('financialTableId is required', () => {
      const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
      caseFinancialAssistanceEntity.financialAssistanceTableId = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('The financial assistance table is required');
    });

    test('case-file is required', () => {
      const caseFinancialAssistanceEntity = new FinancialAssistancePaymentEntity(mockData);
      caseFinancialAssistanceEntity.caseFileId = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('A linked case-file is required');
    });
  });
});
