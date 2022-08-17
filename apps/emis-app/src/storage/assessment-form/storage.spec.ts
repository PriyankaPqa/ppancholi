import { ASSESSMENT_FORM_ENTITIES, ASSESSMENT_FORM_METADATA } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { mockAssessmentFormEntity, mockAssessmentFormMetadata } from '@libs/entities-lib/assessment-template';
import { AssessmentFormStorage } from './storage';

const entityModuleName = ASSESSMENT_FORM_ENTITIES;
const metadataModuleName = ASSESSMENT_FORM_METADATA;

const assessmentFormEntity1 = mockAssessmentFormEntity({ id: '1' });
const assessmentFormEntity2 = mockAssessmentFormEntity({ id: '2' });
const assessmentFormMetadata1 = mockAssessmentFormMetadata({ id: '1' });
const assessmentFormMetadata2 = mockAssessmentFormMetadata({ id: '2' });

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        items: [assessmentFormEntity1, assessmentFormEntity2],
      },
    },
    [metadataModuleName]: {
      state: {
        items: [assessmentFormMetadata1, assessmentFormMetadata2],
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new AssessmentFormStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> AssessmentForm Storage', () => {
  describe('>> Actions', () => {
    it('should proxy create', () => {
      const payload = mockAssessmentFormEntity();
      storage.actions.create(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/create`, payload);
    });

    it('should proxy update', () => {
      const payload = mockAssessmentFormEntity();
      storage.actions.update(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/update`, payload);
    });
  });
});
