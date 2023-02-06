import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { mockCaseFileEntities, mockCaseFileMetadata } from '@libs/entities-lib/case-file';
import { getMockExtensionComponents } from '@/pinia/case-file/case-file-extension.mock';

// Should be the same as the original store
const storeId = 'case-file';

export const useMockCaseFileStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockCaseFileEntities()),
    ...getMockExtensionComponents(),
  }));

  const useMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents([mockCaseFileMetadata()]),
  }));

  return {
    pinia: p,
    caseFileStore: useStore(),
    caseFileMetadataStore: useMetadataStore(),
  };
};
