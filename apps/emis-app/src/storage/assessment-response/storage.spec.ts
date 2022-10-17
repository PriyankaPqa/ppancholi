/* eslint-disable @typescript-eslint/no-explicit-any */
import { ASSESSMENT_FORM_ENTITIES, ASSESSMENT_FORM_METADATA } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { mockAssessmentResponseEntity, mockAssessmentResponseMetadata } from '@libs/entities-lib/assessment-template';
import { AssessmentResponseStorage } from './storage';

const entityModuleName = ASSESSMENT_FORM_ENTITIES;
const metadataModuleName = ASSESSMENT_FORM_METADATA;

const assessmentResponseEntity1 = mockAssessmentResponseEntity({ id: '1' });
const assessmentResponseEntity2 = mockAssessmentResponseEntity({ id: '2' });
const assessmentResponseMetadata1 = mockAssessmentResponseMetadata({ id: '1' });
const assessmentResponseMetadata2 = mockAssessmentResponseMetadata({ id: '2' });

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        items: [assessmentResponseEntity1, assessmentResponseEntity2],
      },
    },
    [metadataModuleName]: {
      state: {
        items: [assessmentResponseMetadata1, assessmentResponseMetadata2],
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new AssessmentResponseStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> AssessmentResponse Storage', () => {
  describe('>> Actions', () => {
    it('should proxy create', () => {
      const payload = mockAssessmentResponseEntity();
      storage.actions.create(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/create`, payload);
    });

    it('should proxy update', () => {
      const payload = mockAssessmentResponseEntity();
      storage.actions.update(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/update`, payload);
    });

    it('should proxy saveAssessmentAnsweredQuestions', () => {
      const payload = mockAssessmentResponseEntity();
      storage.actions.saveAssessmentAnsweredQuestions(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/saveAssessmentAnsweredQuestions`, payload);
    });

    it('should proxy editAssessmentAnsweredQuestion', () => {
      const payload = {} as any;
      storage.actions.editAssessmentAnsweredQuestion(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/editAssessmentAnsweredQuestion`, payload);
    });
  });
});
