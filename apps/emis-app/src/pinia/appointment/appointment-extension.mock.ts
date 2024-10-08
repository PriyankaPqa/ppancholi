import { mockAppointment } from '@libs/entities-lib/appointment';

export function getMockAppointmentExtensionComponents() {
  const appointment = mockAppointment();

  return {
    createAppointment: jest.fn(() => appointment),
    editAppointment: jest.fn(() => appointment),
  };
}
