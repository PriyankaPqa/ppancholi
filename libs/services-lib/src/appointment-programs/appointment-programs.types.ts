import { IAppointmentProgram, AppointmentProgram, IdParams, IServiceOption } from '@libs/entities-lib/src/appointment';
import { IMultilingual, Status } from '@libs/shared-lib/src/types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IAppointmentProgramsService extends IDomainBaseService<IAppointmentProgram, IdParams> {
  create(item: AppointmentProgram): Promise<IAppointmentProgram>;
  update(item: AppointmentProgram): Promise<IAppointmentProgram>;
  delete(id: string): Promise<IAppointmentProgram>;
  createServiceOption(appointmentProgramId:string, item: IServiceOption): Promise<IAppointmentProgram>;
  updateServiceOption(appointmentProgramId:string, item: IServiceOption): Promise<IAppointmentProgram>;
  deleteServiceOption(appointmentProgramId:string, itemId: string): Promise<IAppointmentProgram>;
  setAppointmentProgramStatus(id: uuid, appointmentProgramStatus: Status, rationale: string): Promise<IAppointmentProgram>;
  getEmailTemplate(eventId: uuid): Promise<IMultilingual>
}

export interface IAppointmentProgramsServiceMock extends IDomainBaseServiceMock<IAppointmentProgram> {
  create: jest.Mock<IAppointmentProgram>;
  update: jest.Mock<IAppointmentProgram>;
  delete: jest.Mock<IAppointmentProgram>;
  createServiceOption: jest.Mock<IAppointmentProgram>;
  updateServiceOption: jest.Mock<IAppointmentProgram>;
  deleteServiceOption: jest.Mock<IAppointmentProgram>;
  setAppointmentProgramStatus: jest.Mock<IAppointmentProgram>;
  getEmailTemplate: jest.Mock<IMultilingual>;
}
