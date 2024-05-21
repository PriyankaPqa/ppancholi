import { mockAppointmentProgram } from '@libs/entities-lib/appointment';

export function getMockAppointmentProgramExtensionComponents() {
  const appointment = mockAppointmentProgram();

  return {
    createAppointmentProgram: jest.fn(() => appointment),
    updateAppointmentProgram: jest.fn(() => appointment),
  };
}
