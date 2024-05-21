import { mockAppointmentsService } from '@libs/services-lib/appointments';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { IAppointment, mockAppointment, IdParams } from '@libs/entities-lib/appointment';
import { getExtensionComponents } from '@/pinia/appointment/appointment-extension';
import { getBaseStoreComponents } from '@libs/stores-lib/base';

const entityService = mockAppointmentsService();
const baseComponents = getBaseStoreComponents<IAppointment, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-appointment': {
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useAppointmentTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useAppointmentStore = defineStore('test-appointment', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useAppointmentStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useAppointmentTestStore(bComponents);
};

describe('>>> Appointment Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAppointment', () => {
    it('should call addAppointment service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const appointment = mockAppointment();
      const res = {} as IAppointment;
      entityService.create = jest.fn(() => res);
      await store.addAppointment(appointment);

      expect(entityService.create).toBeCalledWith(appointment);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });

  describe('editAppointment', () => {
    it('should call editAppointment service with proper params', async () => {
      const bComponents = { ...baseComponents, set: jest.fn() };
      const store = createTestStore(bComponents);
      const appointment = mockAppointment();
      const res = {} as IAppointment;
      entityService.update = jest.fn(() => res);
      await store.editAppointment(appointment);

      expect(entityService.update).toBeCalledWith(appointment);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
