import { mockCaseFinancialAssistanceEntities, mockCaseFinancialAssistanceEntity } from '@/entities/financial-assistance-payment';
import { IFinancialAssistancePaymentsServiceMock } from './financial-assistance-payments.types';
import { mockDomainBaseService } from '@/services/base/base.mock';

export const mockFinancialAssistanceService = (): IFinancialAssistancePaymentsServiceMock => ({
  ...mockDomainBaseService(mockCaseFinancialAssistanceEntities()),
  addFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  editFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  submitFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  updatePaymentStatus: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  addFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  editFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  deleteFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
});
