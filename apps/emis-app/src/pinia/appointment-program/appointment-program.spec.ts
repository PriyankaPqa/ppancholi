import { mockAppointmentProgramsService } from '@libs/services-lib/appointment-programs';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/appointment-program/appointment-program-extension';
import { createTestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { AppointmentProgram, IAppointmentProgram, IdParams, mockAppointmentProgram } from '@libs/entities-lib/appointment';

const entityService = mockAppointmentProgramsService();
const baseComponents = getBaseStoreComponents<IAppointmentProgram, IdParams>(entityService);

const createTestStore = (opts = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      'test-appointment-program': {
      },
    },
    stubActions: false,
  });

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useCasefileDocumentStore = defineStore('test-appointment-program', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));

  return useCasefileDocumentStore(pinia);
};

describe('Appointment program store', () => {
  describe('create appointment program', () => {
    it('should call service create and commit the result', async () => {
      const store = createTestStore();
      const mockProgram = new AppointmentProgram(mockAppointmentProgram());
      entityService.create = jest.fn(() => mockProgram);
      await store.createAppointmentProgram(mockProgram);

      expect(entityService.create).toBeCalledWith(mockProgram);
      expect(store.items).toContainEqual(mockProgram);
    });
  });
});
