import { IAppointmentProgram, AppointmentProgram, IdParams, AppointmentProgramStatus } from '@libs/entities-lib/src/appointment';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IAppointmentProgramsService extends IDomainBaseService<IAppointmentProgram, IdParams> {
  create(item: AppointmentProgram): Promise<IAppointmentProgram>;
  update(item: AppointmentProgram): Promise<IAppointmentProgram>;
  setAppointmentProgramStatus(id: uuid, appointmentProgramStatus: AppointmentProgramStatus, rationale: string): Promise<IAppointmentProgram>
}

export interface IAppointmentProgramsServiceMock extends IDomainBaseServiceMock<IAppointmentProgram> {
  create: jest.Mock<IAppointmentProgram>;
  update: jest.Mock<IAppointmentProgram>;
  setAppointmentProgramStatus: jest.Mock<IAppointmentProgram>;
}
