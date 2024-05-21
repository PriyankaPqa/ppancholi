import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { getMockAppointmentExtensionComponents } from '@/pinia/appointment/appointment-extension.mock';
import { mockAppointment } from '@libs/entities-lib/appointment';

const storeId = 'appointment';

export const useMockAppointmentStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useAppointmentStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockAppointment()]),
    ...getMockAppointmentExtensionComponents(),
  }));

  return {
    pinia: p,
    appointmentStore: useAppointmentStore(),
  };
};
