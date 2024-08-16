import { mockAppointmentProgram } from '@libs/entities-lib/appointment';

export function getMockAppointmentProgramExtensionComponents() {
  const appointment = mockAppointmentProgram();

  return {
    createAppointmentProgram: jest.fn(() => appointment),
    updateAppointmentProgram: jest.fn(() => appointment),
    createServiceOption: jest.fn(() => appointment),
    updateServiceOption: jest.fn(() => appointment),
    setAppointmentProgramStatus: jest.fn(() => appointment),
  };
}
