import { mockCaseFinancialAssistanceEntity } from '@/entities/financial-assistance-payment';
import { IFinancialAssistancePaymentsServiceMock } from './financial-assistance-payments.types';

export const mockFinancialAssistanceService = (): IFinancialAssistancePaymentsServiceMock => ({
  addFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  editFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  addFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
});
