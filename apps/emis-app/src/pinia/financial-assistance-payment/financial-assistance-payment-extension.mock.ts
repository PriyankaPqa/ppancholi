import { IFinancialAssistancePaymentEntity } from '@libs/entities-lib/financial-assistance-payment';
import { ref } from 'vue';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

export function getMockFinancialAssistancePaymentExtensionComponents(entity: IFinancialAssistancePaymentEntity) {
  const options = mockOptionItemData();

  return {
    financialAssistanceCategories: ref([]),
    financialAssistanceCategoriesFetched: false,
    getFinancialAssistanceCategories: jest.fn(() => options),
    fetchFinancialAssistanceCategories: jest.fn(() => options),
    addFinancialAssistancePayment: jest.fn((payload: IFinancialAssistancePaymentEntity) => payload),
    editFinancialAssistancePayment: jest.fn((payload: IFinancialAssistancePaymentEntity) => payload),
    updatePaymentStatus: jest.fn(() => entity),
    submitFinancialAssistancePayment: jest.fn(() => entity),
    submitApprovalRequest: jest.fn(() => entity),
    submitApprovalAction: jest.fn(() => entity),
    addFinancialAssistancePaymentLine: jest.fn(() => entity),
    editFinancialAssistancePaymentLine: jest.fn(() => entity),
    deleteFinancialAssistancePaymentLine: jest.fn(() => entity),
  };
}
