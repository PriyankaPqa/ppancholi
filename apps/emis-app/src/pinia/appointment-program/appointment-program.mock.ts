import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { defineStore } from 'pinia';
import { getMockEntityStoreComponents } from '@libs/stores-lib/base';
import { mockAppointmentProgram } from '@libs/entities-lib/appointment';
import { getMockExtensionComponents } from '@/pinia/appointment-program/appointment-program-extension.mock';

const storeId = 'appointment-program';

export const useMockAppointmentProgramStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia({ stubActions: false });

  const useAppointmentProgramStore = defineStore(`${storeId}-entities`, () => ({
    ...getMockEntityStoreComponents([mockAppointmentProgram()]),
    ...getMockExtensionComponents(),
  }));

  return {
    pinia: p,
    appointmentProgramStore: useAppointmentProgramStore(),
  };
};
