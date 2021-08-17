import { mockCaseFinancialAssistanceEntity } from './case-file-financial-assistance.mock';
import { CaseFinancialAssistanceEntity } from './index';
import { FPaymentStatus } from './case-file-financial-assistance.types';

const mockData = mockCaseFinancialAssistanceEntity();

describe('>>> Case Financial Assistance', () => {
  describe('>> constructor', () => {
    describe('>> instantitate when data is passed', () => {
      it('should instantiate caseFileId', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
        expect(caseFinancialAssistanceEntity.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantitate financialAsssistanceTablleId', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
        expect(caseFinancialAssistanceEntity.financialAssistanceTableId).toEqual(mockData.financialAssistanceTableId);
      });

      it('should instantiate name', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
        expect(caseFinancialAssistanceEntity.name).toEqual(mockData.name);
      });

      it('should instantiate description', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
        expect(caseFinancialAssistanceEntity.description).toEqual(mockData.description);
      });

      it('should instanciate paymentStatus', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
        expect(caseFinancialAssistanceEntity.paymentStatus).toEqual(mockData.paymentStatus);
      });

      it('should instanciate groups', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
        expect(caseFinancialAssistanceEntity.groups).toEqual(mockData.groups);
      });
    });

    describe('>> instantitate when data is not passed', () => {
      it('should instantiate caseFileId', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity();
        expect(caseFinancialAssistanceEntity.caseFileId).toEqual(null);
      });

      it('should instantitate financialAsssistanceTablleId', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity();
        expect(caseFinancialAssistanceEntity.financialAssistanceTableId).toEqual(null);
      });

      it('should instantiate name', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity();
        expect(caseFinancialAssistanceEntity.name).toEqual(null);
      });

      it('should instantiate description', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity();
        expect(caseFinancialAssistanceEntity.description).toEqual(null);
      });

      it('should instanciate paymentStatus', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity();
        expect(caseFinancialAssistanceEntity.paymentStatus).toEqual(FPaymentStatus.New);
      });

      it('should instanciate groups', () => {
        const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity();
        expect(caseFinancialAssistanceEntity.groups).toEqual(null);
      });
    });
  });

  describe('>> validation', () => {
    test('name is required', () => {
      const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
      caseFinancialAssistanceEntity.name = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('The name is required');
    });

    test('groups is required', () => {
      const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
      caseFinancialAssistanceEntity.groups = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('At least one payment line is required');
    });

    test('financialTableId is required', () => {
      const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
      caseFinancialAssistanceEntity.financialAssistanceTableId = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('The financial assistance table is required');
    });

    test('case-file is required', () => {
      const caseFinancialAssistanceEntity = new CaseFinancialAssistanceEntity(mockData);
      caseFinancialAssistanceEntity.caseFileId = null;

      expect(caseFinancialAssistanceEntity.validate()).toContain('A linked case-file is required');
    });
  });
});
