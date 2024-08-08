import { IAppointmentProgram, AppointmentProgram, IdParams } from '@libs/entities-lib/src/appointment';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface IAppointmentProgramsService extends IDomainBaseService<IAppointmentProgram, IdParams> {
  create(item: AppointmentProgram): Promise<IAppointmentProgram>;
  update(item: IAppointmentProgram): Promise<IAppointmentProgram>;
}

export interface IAppointmentProgramsServiceMock extends IDomainBaseServiceMock<IAppointmentProgram> {
  create: jest.Mock<IAppointmentProgram>;
  update: jest.Mock<IAppointmentProgram>;
}
