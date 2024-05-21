import { mockAppointmentProgram } from '@libs/entities-lib/src/appointment';

import { mockDomainBaseService } from '../base';
import { IAppointmentProgramsServiceMock } from './appointment-programs.types';

export const mockAppointmentService = (): IAppointmentProgramsServiceMock => ({
  ...mockDomainBaseService(mockAppointmentProgram()),
  create: jest.fn(() => mockAppointmentProgram()),
  update: jest.fn(() => mockAppointmentProgram()),

});
