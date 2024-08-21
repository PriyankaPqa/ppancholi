import { mockAppointmentProgramsService } from '@libs/services-lib/appointment-programs';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/appointment-program/appointment-program-extension';
import { createTestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import _sortBy from 'lodash/sortBy';
import { AppointmentProgram, IAppointmentProgram, IdParams, mockAppointmentProgram, mockServiceOption } from '@libs/entities-lib/appointment';
import { mockOptionItemsService } from '@libs/services-lib/optionItems';
import { EOptionLists, mockOptionItemData } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/shared-lib/types';

const entityService = mockAppointmentProgramsService();
const optionsService = mockOptionItemsService();
const baseComponents = getBaseStoreComponents<IAppointmentProgram, IdParams>(entityService);

const createTestStore = (opts = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      'test-appointment-program': {
        serviceOptionTypes: mockOptionItemData(),
        appointmentModalities: mockOptionItemData(),
      },
    },
    stubActions: false,
  });

  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionsService);

  const useAppointmentProgramStore = defineStore('test-appointment-program', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));

  return useAppointmentProgramStore(pinia);
};

describe('Appointment program store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getServiceOptionTypes', () => {
    it('returns an array of serviceOptionTypes sorted by orderRank and filtered by status', () => {
      const store = createTestStore();
      const res = store.getServiceOptionTypes();
      expect(res)
        .toEqual(
          _sortBy(mockOptionItemData(), 'orderRank')
            .filter((i) => i.status === Status.Active),
        );
    });
  });

  describe('getAppointmentModalities', () => {
    it('returns an array of appointmentModalities  sorted by orderRank and filtered by status', () => {
      const store = createTestStore();
      const res = store.getAppointmentModalities();
      expect(res)
        .toEqual(
          _sortBy(mockOptionItemData(), 'orderRank')
            .filter((i) => i.status === Status.Active),
        );
    });
  });

  describe('fetchServiceOptionTypes', () => {
    it('calls the getOptionList service and returns the getter', async () => {
      const store = createTestStore();
      store.serviceOptionTypesFetched = false;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchServiceOptionTypes();
      expect(optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.ServiceOptionTypes);
      expect(store.serviceOptionTypesFetched).toEqual(true);
      expect(store.serviceOptionTypes).toEqual(mockOptionItemData());
    });

    test('if the getOptionList action has already been called it will not call the service again', async () => {
      const store = createTestStore();
      store.serviceOptionTypesFetched = true;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchServiceOptionTypes();
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
    });
  });

  describe('fetchAppointmentModalities', () => {
    it('calls the getOptionList service and returns the getter', async () => {
      const store = createTestStore();
      store.appointmentModalitiesFetched = false;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchAppointmentModalities();
      expect(optionsService.getOptionList).toHaveBeenCalledWith(EOptionLists.AppointmentModalities);
      expect(store.appointmentModalitiesFetched).toEqual(true);
      expect(store.serviceOptionTypes).toEqual(mockOptionItemData());
    });

    test('if the getOptionList action has already been called it will not call the service again', async () => {
      const store = createTestStore();
      store.appointmentModalitiesFetched = true;
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
      await store.fetchAppointmentModalities();
      expect(optionsService.getOptionList).toHaveBeenCalledTimes(0);
    });
  });

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

  describe('updateAppointmentProgram', () => {
    it('should call service update and commit the result', async () => {
      const store = createTestStore();
      const mockProgram = new AppointmentProgram(mockAppointmentProgram());
      entityService.update = jest.fn(() => mockProgram);
      await store.updateAppointmentProgram(mockProgram);

      expect(entityService.update).toBeCalledWith(mockProgram);
      expect(store.items).toContainEqual(mockProgram);
    });
  });

  describe('createServiceOption', () => {
    it('should call service create and commit the result', async () => {
      const store = createTestStore();
      const serviceOption = mockServiceOption();
      const mockProgram = new AppointmentProgram(mockAppointmentProgram());
      entityService.createServiceOption = jest.fn(() => mockProgram);
      await store.createServiceOption('id', serviceOption);

      expect(entityService.createServiceOption).toBeCalledWith('id', serviceOption);
      expect(store.items).toContainEqual(mockProgram);
    });
    });

    describe('updateServiceOption', () => {
      it('should call service update and commit the result', async () => {
        const store = createTestStore();
        const serviceOption = mockServiceOption();
        const mockProgram = new AppointmentProgram(mockAppointmentProgram());
        entityService.updateServiceOption = jest.fn(() => mockProgram);
        await store.updateServiceOption('id', serviceOption);

        expect(entityService.updateServiceOption).toBeCalledWith('id', serviceOption);
        expect(store.items).toContainEqual(mockProgram);
      });
    });

    describe('deleteServiceOption', () => {
      it('should call service delete and commit the result', async () => {
        const store = createTestStore();
        const serviceOptionId = 'so-id';
        const apptProgramId = 'id';
        const mockProgram = new AppointmentProgram(mockAppointmentProgram());
        entityService.deleteServiceOption = jest.fn(() => mockProgram);
        await store.deleteServiceOption(apptProgramId, serviceOptionId);

        expect(entityService.deleteServiceOption).toBeCalledWith(apptProgramId, serviceOptionId);
        expect(store.items).toContainEqual(mockProgram);
      });
    });

    describe('setAppointmentProgramStatus', () => {
      it('should call the right service and commit the result', async () => {
        const store = createTestStore();
        const mockProgram = new AppointmentProgram(mockAppointmentProgram());
        entityService.setAppointmentProgramStatus = jest.fn(() => mockProgram);
        await store.setAppointmentProgramStatus(mockProgram.id, mockProgram.appointmentProgramStatus, 'rationale');

        expect(entityService.setAppointmentProgramStatus).toBeCalledWith(mockProgram.id, mockProgram.appointmentProgramStatus, 'rationale');
        expect(store.items).toContainEqual(mockProgram);
      });
    });
  });
