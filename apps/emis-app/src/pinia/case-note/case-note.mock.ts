import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { getMockCaseNoteExtensionComponents } from '@/pinia/case-note/case-note-extension.mock';
import { mockCaseNoteEntities } from '@libs/entities-lib/case-note';

const storeId = 'case-note';

export const useMockCaseNoteStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useCaseNoteStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockCaseNoteEntities()),
    ...getMockCaseNoteExtensionComponents(),
  }));

  return {
    pinia: p,
    caseNoteStore: useCaseNoteStore(),
  };
};
