import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import {
  mockCaseFinancialAssistanceEntities,
  mockCaseFinancialAssistanceEntity,
} from '@libs/entities-lib/financial-assistance-payment';
import { getMockFinancialAssistancePaymentExtensionComponents } from '@/pinia/financial-assistance-payment/financial-assistance-payment-extension.mock';

const storeId = 'financial-assistance-payment';

export const useMockFinancialAssistancePaymentStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockCaseFinancialAssistanceEntities()),
    ...getMockFinancialAssistancePaymentExtensionComponents(mockCaseFinancialAssistanceEntity()),
  }));

  return {
    pinia: p,
    financialAssistancePaymentStore: useStore(),
  };
};
