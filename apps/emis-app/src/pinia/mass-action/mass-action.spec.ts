import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { createTestingPinia } from '@pinia/testing';
import { getExtensionComponents } from '@/pinia/mass-action/mass-action-extension';
import { defineStore } from 'pinia';
import { mockMassActionCreatePayload, mockMassActionService } from '@libs/services-lib/mass-actions/entity';
import {
 IMassActionEntity, MassActionRunType, MassActionType, mockMassActionEntity,
 IdParams,
} from '@libs/entities-lib/mass-action';

const entityService = mockMassActionService();
const baseComponents = getBaseStoreComponents<IMassActionEntity, IdParams>(entityService);

const useTestMassActionStore = (opts = {}) => {
  const pinia = createTestingPinia({ stubActions: false });

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useMassActionStore = defineStore('test-mass-action', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));

  return useMassActionStore(pinia);
};

const createTestStore = (bComponents = {}) => useTestMassActionStore(bComponents);

describe('>>> Mass Action Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('should call the process service with proper parameters and sets the res', async () => {
      const store = createTestStore();
      const id = '1';
      const runType = MassActionRunType.Process;

      await store.process(id, runType);

      expect(entityService.process).toHaveBeenCalledWith(id, runType);
    });

    it('should set the res', async () => {
      const massAction = mockMassActionEntity();
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const id = '1';
      const runType = MassActionRunType.Process;

      entityService.process = jest.fn(() => massAction);
      await store.process(id, runType);

      expect(bComponents.set).toBeCalledWith(massAction);
    });
  });

  describe('update', () => {
    it('should call the update service with proper parameters and commit the res', async () => {
      const store = createTestStore();
      const id = '1';

      const payload = {
        name: 'name',
        description: 'description',
      };

      await store.update(id, payload);

      expect(entityService.update).toHaveBeenCalledWith(id, payload);
    });

    it('should set the res', async () => {
      const massAction = mockMassActionEntity();
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const id = '1';

      const payload = {
        name: 'name',
        description: 'description',
      };

      entityService.update = jest.fn(() => massAction);
      await store.update(id, payload);

      expect(bComponents.set).toBeCalledWith(massAction);
    });
  });

  describe('create', () => {
    describe('Financial assistance', () => {
      it('should call the create service with proper parameters and commit the res', async () => {
        const store = createTestStore();
        const urlSuffix = 'financial-assistance-from-list';
        const massActionType = MassActionType.FinancialAssistance;
        const payload = mockMassActionCreatePayload();

        await store.create(massActionType, payload);

        expect(entityService.create).toHaveBeenCalledWith(urlSuffix, payload);
      });

        it('should set the res', async () => {
          const massAction = mockMassActionEntity();
          const bComponents = { ...baseComponents, set: jest.fn(), addNewlyCreatedId: jest.fn() };
          const store = createTestStore(bComponents);
          const massActionType = MassActionType.FinancialAssistance;
          const payload = mockMassActionCreatePayload();

          entityService.create = jest.fn(() => massAction);
          await store.create(massActionType, payload);

          expect(bComponents.set).toBeCalledWith(massAction);
          expect(bComponents.addNewlyCreatedId).toBeCalledWith(massAction);
        });
    });

    describe('Generate funding request', () => {
      it('should call the create service with proper parameters and commit the res', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const urlSuffix = 'generate-funding';
        const massActionType = MassActionType.GenerateFundingRequest;
        const payload = { name: 'test', description: '' };
        const massAction = mockMassActionEntity();

        await store.create(massActionType, payload);

        expect(entityService.create).toHaveBeenCalledWith(urlSuffix, payload);
        expect(bComponents.set).toBeCalledWith(massAction);
      });
    });

    describe('Assessments request', () => {
      it('should call the create service with proper parameters and commit the res', async () => {
        const bComponents = { ...baseComponents, set: jest.fn() };
        const store = createTestStore(bComponents);
        const urlSuffix = 'assessment-from-list';
        const massActionType = MassActionType.Assessments;
        const payload = { name: 'test', description: '' };
        const massAction = mockMassActionEntity();

        await store.create(massActionType, payload);

        expect(entityService.create).toHaveBeenCalledWith(urlSuffix, payload);
        expect(bComponents.set).toBeCalledWith(massAction);
      });
    });
  });
});
