import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { mockAssessmentFormEntities } from '@libs/entities-lib/assessment-template';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { defineStore } from 'pinia';
import { getMockExtensionComponents } from '@/pinia/assessment-form/assessment-form-extension.mock';

// Should be the same as the original store
const storeId = 'assessment-form';

export const useMockAssessmentFormStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useAssessmentFormStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents(mockAssessmentFormEntities()),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    assessmentFormStore: useAssessmentFormStore(),
  };
};
