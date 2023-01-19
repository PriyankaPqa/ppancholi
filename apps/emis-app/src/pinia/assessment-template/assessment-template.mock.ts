import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { mockAssessmentTemplateEntities, mockAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template';
import { getMockBaseStoreComponents, getMockEntityStoreComponents } from '@libs/stores-lib/base';
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

  const useAssessmentTemplateMetadataStore = defineStore(`${storeId}-metadata`, () => ({
    ...getMockBaseStoreComponents([mockAssessmentTemplateMetadata()]),
  }));

  return {
    pinia: p,
    assessmentTemplateStore: useAssessmentTemplateStore(),
    assessmentTemplateMetadataStore: useAssessmentTemplateMetadataStore(),
  };
};
