import { mockAssessmentFormsService } from '@libs/services-lib/assessment-form/entity';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/assessment-form/assessment-form-extension';
import { Entity } from '@/pinia/assessment-form/assessment-form';
import { defineStore, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import {
  IAssessmentFormEntity, IdParams, mockAssessmentFormEntities,
} from '@libs/entities-lib/assessment-template';

const entityService = mockAssessmentFormsService();
const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-assessment-form': {
        items: mockAssessmentFormEntities(),
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useAssessmentFormTestStore = (opts = {}) => {
  const baseComponents = getBaseStoreComponents<Entity, IdParams>(entityService);

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useAssessmentFormStore = defineStore('test-assessment-form', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useAssessmentFormStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useAssessmentFormTestStore(bComponents);
  return store;
};

describe('>>> AssessmentForm Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchByProgramId', () => {
    it('should call fetchByProgramId service with proper params', async () => {
      const store = createTestStore(baseComponents);

      await store.fetchByProgramId('id');

      expect(entityService.fetchByProgramId).toBeCalledWith('id');
    });
  });

  describe('create', () => {
    it('should call create service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn(), addNewlyCreatedId: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IAssessmentFormEntity;

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
      const payload = {} as IAssessmentFormEntity;

      const res = await store.update(payload);

      expect(entityService.update).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('updateAssessmentStructure', () => {
    it('should call updateAssessmentStructure service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as IAssessmentFormEntity;

      const res = await store.updateAssessmentStructure(payload);

      expect(entityService.updateAssessmentStructure).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
