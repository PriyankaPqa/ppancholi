import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { mockAssessmentResponseEntities } from '@libs/entities-lib/assessment-template';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockExtensionComponents } from '@/pinia/assessment-response/assessment-response-extension.mock';

// Should be the same as the original store
const storeId = 'assessment-response';

export const useMockAssessmentResponseStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useAssessmentResponseStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockAssessmentResponseEntities()),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    assessmentResponseStore: useAssessmentResponseStore(),
  };
};
