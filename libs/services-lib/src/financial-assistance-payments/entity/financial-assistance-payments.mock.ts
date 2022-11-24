import {
  mockCaseFinancialAssistanceEntities,
  mockCaseFinancialAssistanceEntity,
  mockFinancialPaymentHistory,
  mockPaymentSummary,
} from '@libs/entities-lib/financial-assistance-payment';
import { mockDomainBaseService } from '../../base';
import { IFinancialAssistancePaymentsServiceMock } from './financial-assistance-payments.types';

export const mockFinancialAssistanceService = (): IFinancialAssistancePaymentsServiceMock => ({
  ...mockDomainBaseService(mockCaseFinancialAssistanceEntities()),
  addFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  editFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  submitFinancialAssistancePayment: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  submitApprovalRequest: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  submitApprovalAction: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  updatePaymentStatus: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  addFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  editFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  deleteFinancialAssistancePaymentLine: jest.fn(() => mockCaseFinancialAssistanceEntity()),
  getHistory: jest.fn(() => mockFinancialPaymentHistory()),
  getMetadataHistory: jest.fn(() => []),
  getPaymentSummary: jest.fn(() => mockPaymentSummary()),
  getNextApprovalGroupRoles: jest.fn(() => []),
});
