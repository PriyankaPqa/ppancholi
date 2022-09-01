import { ASSESSMENT_TEMPLATE_ENTITIES, ASSESSMENT_TEMPLATE_METADATA } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { mockAssessmentTemplateEntity, mockAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template';
import { AssessmentTemplateStorage } from './storage';

const entityModuleName = ASSESSMENT_TEMPLATE_ENTITIES;
const metadataModuleName = ASSESSMENT_TEMPLATE_METADATA;

const assessmentTemplateEntity1 = mockAssessmentTemplateEntity({ id: '1' });
const assessmentTemplateEntity2 = mockAssessmentTemplateEntity({ id: '2' });
const assessmentTemplateMetadata1 = mockAssessmentTemplateMetadata({ id: '1' });
const assessmentTemplateMetadata2 = mockAssessmentTemplateMetadata({ id: '2' });

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        items: [assessmentTemplateEntity1, assessmentTemplateEntity2],
      },
    },
    [metadataModuleName]: {
      state: {
        items: [assessmentTemplateMetadata1, assessmentTemplateMetadata2],
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new AssessmentTemplateStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> AssessmentTemplate Storage', () => {
  describe('>> Actions', () => {
    it('should proxy create', () => {
      const payload = mockAssessmentTemplateEntity();
      storage.actions.create(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/create`, payload);
    });

    it('should proxy update', () => {
      const payload = mockAssessmentTemplateEntity();
      storage.actions.update(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/update`, payload);
    });

    it('should proxy updateAssessmentStructure', () => {
      const payload = mockAssessmentTemplateEntity();
      storage.actions.updateAssessmentStructure(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updateAssessmentStructure`, payload);
    });
  });
});
