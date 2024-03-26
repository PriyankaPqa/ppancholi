import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { mockAssessmentTemplateEntities } from '@libs/entities-lib/assessment-template';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockExtensionComponents } from '@/pinia/assessment-template/assessment-template-extension.mock';

// Should be the same as the original store
const storeId = 'assessment-template';

export const useMockAssessmentTemplateStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useAssessmentTemplateStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockAssessmentTemplateEntities()),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    assessmentTemplateStore: useAssessmentTemplateStore(),
  };
};
