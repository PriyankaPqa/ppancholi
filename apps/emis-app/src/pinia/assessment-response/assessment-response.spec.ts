import { mockAssessmentResponsesService } from '@libs/services-lib/assessment-response/entity';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/assessment-response/assessment-response-extension';
import { Entity } from '@/pinia/assessment-response/assessment-response';
import { defineStore, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import {
  IAssessmentResponseEntity, IQuestionResponse, IdParams, mockAssessmentResponseEntities,
} from '@libs/entities-lib/assessment-template';

const entityService = mockAssessmentResponsesService();
const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-assessment-response': {
        items: mockAssessmentResponseEntities(),
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useAssessmentResponseTestStore = (opts = {}) => {
  const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useAssessmentResponseStore = defineStore('test-assessment-response', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useAssessmentResponseStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useAssessmentResponseTestStore(bComponents);
  return store;
};

describe('>>> AssessmentResponse Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn(), addNewlyCreatedId: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IAssessmentResponseEntity;

      const res = await store.create(payload);

      expect(entityService.create).toBeCalledWith(payload);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('update', () => {
    it('should call update service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IAssessmentResponseEntity;

      const res = await store.update(payload);

      expect(entityService.update).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('saveAssessmentAnsweredQuestions', () => {
    it('should call saveAssessmentAnsweredQuestions service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IAssessmentResponseEntity;

      const res = await store.saveAssessmentAnsweredQuestions(payload);

      expect(entityService.saveAssessmentAnsweredQuestions).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(res);
    });

    describe('editAssessmentAnsweredQuestion', () => {
      it('should call editAssessmentAnsweredQuestion service with proper params', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const payload = { id: 'test' } as {
          id: string, responses: IQuestionResponse[], assessmentQuestionIdentifier: string, parentIndexPath: string, questionId: string };

        const res = await store.editAssessmentAnsweredQuestion(payload);

        expect(entityService.editAssessmentAnsweredQuestion).toBeCalledWith(payload.id, payload);
        expect(bComponents.set).toBeCalledWith(res);
      });
    });
  });
});
