import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockExtensionComponents } from '@/pinia/case-file-document/case-file-document-extension.mock';
import { mockCaseFileDocumentEntities } from '@libs/entities-lib/case-file-document';

// Should be the same as the original store
const storeId = 'case-file-document';

export const useMockCaseFileDocumentStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useCaseFileDocumentStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockCaseFileDocumentEntities()),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    caseFileDocumentStore: useCaseFileDocumentStore(),
  };
};
