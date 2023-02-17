import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import {
  mockFinancialAssistanceTableEntity,
  mockFinancialAssistanceMetadata,
} from '@libs/entities-lib/financial-assistance';
import { getMockFinancialAssistanceExtensionComponents } from '@/pinia/financial-assistance/financial-assistance-extension.mock';

const storeId = 'financial-assistance';

export const useMockFinancialAssistanceStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockFinancialAssistanceTableEntity()]),
    ...getMockFinancialAssistanceExtensionComponents(mockFinancialAssistanceTableEntity()),
  }));

  const useMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents([mockFinancialAssistanceMetadata()]),
  }));
  return {
    pinia: p,
    financialAssistanceStore: useStore(),
    financialAssistanceMetadataStore: useMetadataStore(),
  };
};
