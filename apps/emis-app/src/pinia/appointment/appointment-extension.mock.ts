import { mockAppointment } from '@libs/entities-lib/appointment';

export function getMockAppointmentExtensionComponents() {
  const appointment = mockAppointment();

  return {
    addAppointment: jest.fn(() => appointment),
    editAppointment: jest.fn(() => appointment),
  };
}
