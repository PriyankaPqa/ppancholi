import { IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';

export function getMockFinancialAssistancePaymentExtensionComponents(entity: IFinancialAssistancePaymentEntity) {
  return {
    addFinancialAssistancePayment: jest.fn((payload: IFinancialAssistancePaymentEntity) => payload),
    editFinancialAssistancePayment: jest.fn((payload: IFinancialAssistancePaymentEntity) => payload),
    updatePaymentStatus: jest.fn(() => entity),
    submitFinancialAssistancePayment: jest.fn(() => entity),
    submitApprovalRequest: jest.fn(() => entity),
    submitApprovalAction: jest.fn(() => entity),
    addFinancialAssistancePaymentLine: jest.fn(() => entity),
    editFinancialAssistancePaymentLine: jest.fn(() => entity),
    deleteFinancialAssistancePaymentLine: jest.fn(() => entity),
    fetchHistory: jest.fn(() => []),
  };
}
