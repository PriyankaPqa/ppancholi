import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockCaseFileIndividualEntities } from '@libs/entities-lib/case-file-individual';
import { getMockCaseFileIndividualExtensionComponents } from '@/pinia/case-file-individual/case-file-individual-extension.mock';

const storeId = 'case-file-individual';

export const useMockCaseFileIndividualStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useCaseFileIndividualStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockCaseFileIndividualEntities()),
    ...getMockCaseFileIndividualExtensionComponents(),
  }));

  return {
    pinia: p,
    caseFileIndividualStore: useCaseFileIndividualStore(),
  };
};
