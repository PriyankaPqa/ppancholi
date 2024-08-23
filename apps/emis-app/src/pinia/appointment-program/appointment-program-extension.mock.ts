import { mockAppointmentProgram } from '@libs/entities-lib/appointment';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { ref } from 'vue';

export function getMockExtensionComponents() {
  const appointment = mockAppointmentProgram();

  return {
    serviceOptionTypes: ref([]),
    appointmentModalities: ref([]),
    getServiceOptionTypes: jest.fn(() => mockOptionItemData()),
    getAppointmentModalities: jest.fn(() => mockOptionItemData()),
    fetchServiceOptionTypes: jest.fn(() => mockOptionItemData()),
    fetchAppointmentModalities: jest.fn(() => mockOptionItemData()),
    createAppointmentProgram: jest.fn(() => appointment),
    updateAppointmentProgram: jest.fn(() => appointment),
    createServiceOption: jest.fn(() => appointment),
    updateServiceOption: jest.fn(() => appointment),
    deleteServiceOption: jest.fn(() => appointment),
    setAppointmentProgramStatus: jest.fn(() => appointment),
  };
}
