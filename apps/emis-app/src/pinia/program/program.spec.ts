import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/program/program-extension';
import { defineStore } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import {
 IProgramEntity, mockProgramEntity,
IdParams,
} from '@libs/entities-lib/program';
import { mockProgramsService } from '@libs/services-lib/programs/entity';

const entityService = mockProgramsService();
const baseComponents = getBaseStoreComponents<IProgramEntity, IdParams>(entityService);

const useTestProgramStore = (opts = {}) => {
  const pinia = createTestingPinia({ stubActions: false });

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useProgramStore = defineStore('test-program', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));

  return useProgramStore(pinia);
};

const createTestStore = (bComponents = {}) => useTestProgramStore(bComponents);

describe('>>> Program Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProgram', () => {
    it('calls the createProgram service', async () => {
      const store = createTestStore();
      const program = mockProgramEntity();
      await store.createProgram(program);
      expect(entityService.createProgram).toHaveBeenCalledWith(program);
    });

    it('calls sets the result', async () => {
      const program = mockProgramEntity();
      const bComponents = { ...baseComponents, set: jest.fn(), addNewlyCreatedId: jest.fn() };
      const store = createTestStore(bComponents);
      entityService.createProgram = jest.fn(() => program);

      await store.createProgram(program);

      expect(bComponents.set).toHaveBeenCalledWith(program);
      expect(bComponents.addNewlyCreatedId).toHaveBeenCalledWith(program);
    });
  });

  describe('updateProgram', () => {
    it('calls the updateProgram service', async () => {
      const store = createTestStore();
      const program = mockProgramEntity();

      await store.updateProgram(program);
      expect(entityService.updateProgram).toHaveBeenCalledWith(program);
    });

    it('calls sets the result', async () => {
      const program = mockProgramEntity();
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      entityService.updateProgram = jest.fn(() => program);

      await store.updateProgram(program);

      expect(bComponents.set).toHaveBeenCalledWith(program);
    });
  });
});
