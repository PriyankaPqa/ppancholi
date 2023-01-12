import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockExtensionComponents } from '@/pinia/case-file-document/case-file-document-extension.mock';
import { mockCaseFileDocumentEntities, mockCaseFileDocumentMetadatum } from '@libs/entities-lib/case-file-document';

// Should be the same as the original store
const storeId = 'case-file-document';

export const useMockCaseFileDocumentStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useCaseFileDocumentStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockCaseFileDocumentEntities()),
    ...getMockExtensionComponents(),
  }));

  const useCaseFileDocumentMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents(mockCaseFileDocumentMetadatum()),
  }));

  return {
    pinia: p,
    caseFileDocumentStore: useCaseFileDocumentStore(),
    caseFileDocumentMetadataStore: useCaseFileDocumentMetadataStore(),
  };
};
