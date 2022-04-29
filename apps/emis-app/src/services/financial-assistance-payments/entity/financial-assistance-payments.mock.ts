import {
  mockCaseFinancialAssistanceEntities,
  mockCaseFinancialAssistanceEntity,
  mockFinancialPaymentHistory,
  mockPaymentSummary,
} from '@/entities/financial-assistance-payment';
import { mockDomainBaseService } from '@libs/core-lib/services/base';
import { IFinancialAssistancePaymentsServiceMock } from './financial-assistance-payments.types';

export const mockFinancialAssistanceService = (): IFinancialAssistancePaymentsServiceMock => ({
  ...mockDomainBaseService(mockCaseFinancialAssistanceEntities()),
  addFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  editFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  submitFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  updatePaymentStatus: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  addFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  editFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  deleteFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  getHistory: jest.fn(() => mockFinancialPaymentHistory()),
  getMetadataHistory: jest.fn(() => []),
  getPaymentSummary: jest.fn(() => mockPaymentSummary()),
});
