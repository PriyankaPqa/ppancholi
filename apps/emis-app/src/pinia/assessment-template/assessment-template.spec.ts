import { mockAssessmentTemplatesService } from '@libs/services-lib/assessment-template/entity';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/assessment-template/assessment-template-extension';
import { Entity } from '@/pinia/assessment-template/assessment-template';
import { defineStore, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import {
  IAssessmentTemplateEntity, IdParams, mockAssessmentTemplateEntities,
} from '@libs/entities-lib/assessment-template';

const entityService = mockAssessmentTemplatesService();
const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-assessment-template': {
        items: mockAssessmentTemplateEntities(),
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useAssessmentTemplateTestStore = (opts = {}) => {
  const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useAssessmentTemplateStore = defineStore('test-assessment-template', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useAssessmentTemplateStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useAssessmentTemplateTestStore(bComponents);
  return store;
};

describe('>>> AssessmentTemplate Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn(), addNewlyCreatedId: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IAssessmentTemplateEntity;

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
      const payload = {} as IAssessmentTemplateEntity;

      const res = await store.update(payload);

      expect(entityService.update).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('updateAssessmentStructure', () => {
    it('should call updateAssessmentStructure service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IAssessmentTemplateEntity;

      const res = await store.updateAssessmentStructure(payload);

      expect(entityService.updateAssessmentStructure).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
