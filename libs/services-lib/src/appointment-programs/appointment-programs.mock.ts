import { mockAppointmentProgram } from '@libs/entities-lib/appointment';

import { mockDomainBaseService } from '../base';
import { IAppointmentProgramsServiceMock } from './appointment-programs.types';

export const mockAppointmentProgramsService = (): IAppointmentProgramsServiceMock => ({
  ...mockDomainBaseService(mockAppointmentProgram()),
  create: jest.fn(() => mockAppointmentProgram()),
  update: jest.fn(() => mockAppointmentProgram()),
  createServiceOption: jest.fn(() => mockAppointmentProgram()),
  updateServiceOption: jest.fn(() => mockAppointmentProgram()),
  setAppointmentProgramStatus: jest.fn(() => mockAppointmentProgram()),
});
